Array.prototype.flatten = function() {
    return Array.prototype.concat.apply([], this);
};

function getVarForms() {
    return Array.prototype.slice.call(document.getElementById("variables").getElementsByTagName("form")).filter(form=>form.name.startsWith("form")).slice(1); // first element is "form-1"
}

function getVarNames() {
    return getVarForms().map(form=>form.varname.value);
}
function getVarValues() {
    var varForms = getVarForms();
    var varValues = Array.from(varForms.entries()).map(function([form_id,form]) {
        var list =form.list.value.split("\n")
        if (document.advanced.skip_empty.checked) {
            list = list.filter(a=>a.length>0);
        }
        return list
    });
    return varValues;
}
function getVarJoins() {
    var varForms = getVarForms();
    var varJoin = Array.from(varForms.entries()).map(function([form_id,form]) {
        join_form = document.getElementById('join'+form_id)
        return {checked:join_form.join_lines.checked, separator:join_form.separator.value};
    });
    return varJoin;
}

function generate() {
    var vars = getVarValues();
    var varNames = getVarNames();
    var varJoins = getVarJoins();

    var templates=[document.template_form.template.value];
    for (var i =0; i < varNames.length; i++) {
        var varName = varNames[i];
        var list = vars[i];
        if (varJoins[i].checked) {
            list = [list.join(varJoins[i].separator)];
        }
        var re = new RegExp("\\?{"+varName+"}","g");
        templates = templates.map(template =>list.map(e=>template.replace(re,e))).flatten();
    }
    document.output.output.value = templates.join('\n') + '\n';
    encode_params();
    document.getElementById('copy_all_button').disabled = false;
    document.getElementById('copy_first_button').disabled = false;
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
    document.getElementById('copy_all_button').disabled = true;
    document.getElementById('copy_first_button').disabled = true;
}

function copy_to_clipboard(s)
{
    var ta = document.createElement("textarea");
    ta.value = s;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.parentElement.removeChild(ta);
}

function add_variable(name, value="")
{
    var variables = document.getElementById("variables");
    var listItems = variables.getElementsByTagName("li");
    var index = Number(listItems[listItems.length-2].getElementsByTagName('form')[0].name.slice(4))+1
    cloned = listItems[0].cloneNode(true);
    cloned.style.display=null;
    cloned.getElementsByTagName('form')[0].name = 'form'+(index);
    cloned.id = 'var'+(index);
    if (name === undefined) {
        name = 'var'+(index)
    }
    var varname_input = cloned.getElementsByTagName('input').varname;
    varname_input.value = name;
    cloned.getElementsByTagName('textarea')[0].value = value;
    cloned.getElementsByTagName('form')[2].id = 'join'+(index);
    cloned.getElementsByTagName('form')[1].name = 'seq'+(index);
    cloned.getElementsByTagName('form')[1].seqButton.onclick=metaSeq(index);
    cloned.getElementsByTagName('form')[0].closeButton.onclick=metaDeleteVariable(index);
    cloned.getElementsByTagName('form')[0].copyButton.onclick=function(){
        copy_to_clipboard('?{'+varname_input.value+'}');
    }
    if (index==0) {
        cloned.getElementsByTagName('form')[0].closeButton.style = 'display:none;'; // no close button for the 1st variable
    }
    variables.insertBefore(cloned, listItems[listItems.length-2].nextSibling);
}

function copy_all_lines()
{
    if (document.output.output.value) {
        copy_to_clipboard(document.output.output.value);
    }
}

function copy_first_line()
{
    if (document.output.output.value) {
        copy_to_clipboard(document.output.output.value.split('\n')[0]);
    }
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
        for (var i = start; i < end; i += step) {
            lines.push(sprintf(format, i));
        }
        document.getElementsByName('form'+index)[0].list.value = lines.join("\n");
    }
    return seq;
}

function metaDeleteVariable(index)
{
    function deleteVariable()
    {
        if (index > 0) {
            var li = document.getElementById('var'+index);
            li.parentNode.removeChild(li);
        }
    }
    return deleteVariable;
}
