'use strict';

const fs = require('fs');
const Absurd = require('absurd');
const JefNode = require('json-easy-filter').JefNode;
const absurd = Absurd();
const _ = require('lodash');
const output_file = 'html_test/css/hero_style.css';


fs.readFile('hero_test.json', (err, data) => {
    if (err) {
        throw err;
    }
    const jsonTree = JSON.parse(data);
    const hierarchyTree = jsonTree.hierarchy;
    let depth = 0;
    let h_depth = 0;
    let parent = "";
    let html_string = "";

    // transform html hierarchy here.
    let div_array = [];

    let open_depth = -1;
    let variable_array = [];

    let children = 0;

    const res = new JefNode(hierarchyTree).filter((node) => {


            if(node.key==='subview'){
                console.log("is subview number of children = " + node.count);
                children = node.count;
                return;
            }

            if (node.has('type')) {
                if (children > 0) {
                    const t = node.value;
                    const n = node.key;
                    let base_class = n.replace(".", " ");
                    base_class = base_class.replace(".", " ");
                    if ((t.type == 'div') || (t.type == 'text')) {              // or we can test for 'icon' etc.
                        console.log(`divid -${t.id}`);
                        console.log(`divstyle${t.style_class}`);
                        console.log(`hierarchydepth${depth}`);

                        html_string += '<div id="' + t.id + '" class="' + t.style_class + base_class + '"></div>';
                    }
                    children--;
                } else {
                    const t = node.value;
                    const n = node.key;
                    let base_class = n.replace(".", " ");
                    base_class = base_class.replace(".", " ");
                    if ((t.type == 'div') || (t.type == 'text')) {              // or we can test for 'icon' etc.
                        console.log(`divid -${t.id}`);
                        console.log(`divstyle${t.style_class}`);
                        console.log(`hierarchydepth${depth}`);
                        div_array.push(`<div id="${t.id}" class="${t.style_class}${base_class}">`);
                        html_string += '<div id="' + t.id + '" class="' + t.style_class + base_class + '">';
                    }
                }
            }
        });

        //if(node.key==='subview') {
        //    console.log("is subview number of children = "+node.count);
        //
        //    //console.log("parent = subview and node name is "+node.key);
        //    //if (node.has('type')) {
        //    //    const t = node.value;
        //    //    const n = node.key;
        //    //    let base_class = n.replace("."," ");
        //    //    base_class = base_class.replace("."," ");
        //    //    if ((t.type == 'div') || (t.type == 'text')) {              // or we can test for 'icon' etc.
        //    //        console.log(`div id - ${t.id}`);
        //    //        console.log(`div style ${t.style_class}`);
        //    //        console.log(`hierarchy depth ${depth}`);
        //    //
        //    //        html_string += '<div id="'+t.id+'" class="'+t.style_class+base_class+'">';
        //    //    }
        //    //}
        //}else{
        //    //console.log("parent not subview and node name is "+node.key);
        //    //if (node.has('type')) {
        //    //    const t = node.value;
        //    //    const n = node.key;
        //    //    let base_class = n.replace("."," ");
        //    //    base_class = base_class.replace("."," ");
        //    //    if ((t.type == 'div') || (t.type == 'text')) {              // or we can test for 'icon' etc.
        //    //        console.log(`div id - ${t.id}`);
        //    //        console.log(`div style ${t.style_class}`);
        //    //        console.log(`hierarchy depth ${depth}`);
        //    //        if(open_depth != depth) {
        //    //            div_array.push(`<div id="${t.id}" class="${t.style_class}${base_class}">`);
        //    //            html_string += '<div id="'+t.id+'" class="'+t.style_class+base_class+'">';
        //    //            open_depth = depth;
        //    //        }
        //    //        // we know its a div here, and we know the hierarchy depth (depth) so we can do div within div
        //    //
        //    //        if (node.level > h_depth) {
        //    //            h_depth = node.level;
        //    //            depth++;
        //    //        }
        //    //        if (node.level < h_depth) {
        //    //            h_depth = node.level;
        //    //            depth--;
        //    //        }
        //    //    }
        //    //}
        //}
    //});
    let iter = 0;
    div_array.forEach(function (d) {
        let output_string = " ".repeat(iter * 4) + d;
        iter++;
        console.log(output_string);
    });
    iter--;
    for (let i = 0; i < div_array.length; i++) {
        let output_string = " ".repeat(iter * 4) + '</div>'
        html_string += " ".repeat(iter * 4) + '</div>';
        iter--;
        console.log(output_string);
    }

    console.log("html_string = "+html_string);

    const styleTree = jsonTree.style;

    // transformation style  here.
    absurd.hook("add", function (rules) {
        const res = new JefNode(rules).filter((node) => {
            // store variables..
            if (node.isRoot) {
                let val = node.value;
                if (val) {
                    for (let i in val) {
                        let p = i;
                        if (p.indexOf('$') > -1) {
                            let var_val = val[i];
                            variable_array.push({ var: p, value: var_val });
                            delete rules[p];
                        }
                    }
                }
            }
            if (!node.isRoot && !node.isLeaf) {
                let val = node.value;
                if (val) {
                    for (let i in val) {
                        const variable_reference = val[i];
                        if (variable_reference.indexOf('$') > -1) {
                            const p = _.find(variable_array, function (o) { return o.var == variable_reference; });
                            // look up the variable.
                            val[i] = p.value;
                        }
                    }
                }
            }


            if (node.has('font-size')) {
                const t = node.value;
                let v = t['font-size'];
                v = v.replace('px', '');
                t['font-size'] = v;
            }
            // above will remove px from all font-sizes;
            // you can of course do it gloally. uncomment
            // if (!node.isRoot && !node.isLeaf) {
            //     let t2 = node.value;
            //     if (t2) {
            //         for (let i in t2) {
            //             if (t2[i].indexOf('px' > -1)) {
            //                 t2[i] = t2[i].replace('px', '')
            //             }
            //         }
            //     }
            // }
        })
    });

    absurd.add(styleTree).compile((err, css) => {
        // output the css to disk for web here
        fs.writeFile(output_file, css, function (err) {
            if (err) throw err;
            console.log('\nCSS Style written...');
        });
    });

});
