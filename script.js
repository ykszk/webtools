Array.prototype.flatten = function() {
    return Array.prototype.concat.apply([], this);
};

function getVarNames() {
    return Array.prototype.slice.call(document.getElementById("variables").getElementsByTagName("form")).filter(form=>form.name.startsWith("form")).map(form=>form.varname.value).slice(1);
}
function getVarValues() {
    var varForms = Array.prototype.slice.call(document.getElementById("variables").getElementsByTagName("form"));
    varForms = varForms.filter(form=>form.name.startsWith("form"));
    var varValues = varForms.map(function(form) {
        var list =form.list.value.split("\n")
        if (document.advanced.skip_empty.checked) {
            list = list.filter(a=>a.length>0);
        }
        return list;
    });
    return varValues.slice(1);
}

function generate() {
    var vars = getVarValues();
    var varNames = getVarNames();

    var templates=[document.template_form.template.value];
    for (var i =0; i < varNames.length; i++) {
        var varName = varNames[i];
        var list = vars[i];
        var re = new RegExp("\\?{"+varName+"}","g");
        templates = list.map(e =>templates.map(t=>t.replace(re,e))).flatten();
    }

    document.output.output.value = templates.join('\n');
}

function reset()
{
    document.template_form.template.value='';
    document.form0.list.value='';
    document.form0.varname.value='var0';
    document.output.output.value='';
    while (document.getElementById("variables").getElementsByTagName("li").length > 3) {
        document.getElementById("variables").getElementsByTagName("li")[2].remove();
    }
    encode_params();
}

function add_variable(name, value="")
{
    var variables = document.getElementById("variables");
    var listItems = variables.getElementsByTagName("li");
    var index = listItems.length-2
    last = listItems[index];
    cloned = listItems[0].cloneNode(true);
    cloned.style.display=null;
    cloned.getElementsByTagName('form')[0].name = 'form'+(index);
    if (name === undefined) {
        name = 'var'+(index)
    }
    cloned.getElementsByTagName('input')[0].value = name;
    cloned.getElementsByTagName('textarea')[0].value = value;
    cloned.getElementsByTagName('form')[1].name = 'seq'+(index);
    cloned.getElementsByTagName('form')[1].seqButton.onclick=metaSeq(index);
    variables.insertBefore(cloned, last.nextSibling);
}

function encode_params()
{
    params = [['template',[document.template_form.template.value]]]
    if (params[0][1]=="") {
        params.pop()
    }
    var vars = getVarValues();
    var varNames = getVarNames();
    for (var i = 0; i < vars.length; i++) {
        if (vars[i] != "") {
            params.push([varNames[i],vars[i]]);
        }
    }
    if (params.length > 0) {
        params_str = params.map(name_values => name_values[0]+'='+encodeURIComponent(name_values[1].join("\n"))).join("&")
        new_uri = (location.pathname.split('/').pop()+'?'+params_str);
        history.replaceState({},'',new_uri);
    } else {
        new_uri = (location.pathname.split('/').pop());
        history.replaceState({},'',new_uri);
    }
}

function decode_params()
{
    text = location.search.substr(1);
    sep = '&';
    eq = '=';
    params = text.split(sep).filter(e=>e!="").map(e=>e.split(eq));
    if (params.length > 0 && params[0][0]==='template') {
        document.template_form.template.value = decodeURIComponent(params[0][1]);
        params.shift()
    }
    if (params.length == 0) {
        add_variable();
    } else {
        for (var i = 0; i < params.length; i++) {
            add_variable(params[i][0],decodeURIComponent(params[i][1]));
        }
    }
}

function padZeros(i, figs){
    return ( "0".repeat(figs-1) + i ).substr(-figs);
}
function sprintf(format, i){
    var re = new RegExp("%(0\\d*)?d");
    var m = format.match(re);
    if (m === null) {
        return null;
    } else {
        if (m.length > 1) {
            var figs = Math.max(1, Number(m[1]));
            return format.replace(re, padZeros(i, figs));
        } else {
            return format.replace(re, String(i));
        }
    }
}

function metaSeq(index)
{
    function seq()
    {
        var seqNode = document.getElementsByName("seq"+index)[0];//document.seq0;
        var start = Number(seqNode.start.value);
        var end = Number(seqNode.end.value);
        var step = Number(seqNode.step.value);
        var format = seqNode.format.value;
        if (sprintf(format,0) === null) {
            alert("Invalid format : "+format);
            return;
        }
        var lines = []
        for (var i = 0; i < end; i += step) {
            lines.push(sprintf(format, i));
        }
        document.getElementsByName('form'+index)[0].list.value = lines.join("\n");
    }
    return seq;
}
