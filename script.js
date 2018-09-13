function decode_params()
{
    text = location.search.substr(1);
    sep = '&';
    eq = '=';
    params = text.split(sep).reduce(function(obj, v) {
        var pair = v.split(eq);
        obj[pair[0]] = decodeURIComponent(pair[1]);
        return obj;
    }, {});
    if (params['template']) {
        document.template_form.template.value = decodeURIComponent(params['template']);
    }
    if (params['var0']) {
        document.form0.list.value = decodeURIComponent(params['var0']);
    }
}

function encode_params()
{
    params = {'template':document.template_form.template.value, 'var0':document.form0.list.value};
    filtered_params = ['template','var0'].filter(key => params[key]);
    if (filtered_params.length > 0) {
        params_str = filtered_params.map(key => key+'='+encodeURIComponent(params[key])).reduce((a,b) => a+'&'+b)
        new_uri = (location.pathname.split('/').pop()+'?'+params_str);
        history.replaceState({},'',new_uri);
    } else {
        new_uri = (location.pathname.split('/').pop());
        history.replaceState({},'',new_uri);
    }
}

function generate() {
    var template=document.template_form.template.value;
    var list =document.form0.list.value.split("\n").map(a=>a.replace('\r',''));
    if (document.advanced.skip_empty.checked) {
        list = list.filter(a=>a.length>0)
    }

    var re = new RegExp("\\?{"+document.form0.varname.value+"}","g");
    replaced = list.map(e => template.replace(re,e));
    catted = replaced.reduce((a,b)=>a+"\n"+b);
    document.output.output.value = catted + '\n';
}

function reset()
{
    document.template_form.template.value='';
    document.form0.list.value='';
    console.log(document.form0.list.value);
    document.output.output.value='';
    encode_params();
}

prependChild = function(el){
    this.insertBefore(el, this.firstChild)
}

function add_variable()
{
    var variables = document.getElementById("variables");
    var listItems = variables.getElementsByTagName("li");
    var index = listItems.length-2
    last = listItems[index];
    cloned = last.cloneNode(true);
    cloned.getElementsByTagName('form')[0].name = 'form'+(index+1);
    cloned.getElementsByTagName('input')[0].value = 'var'+(index+1);
    variables.insertBefore(cloned, last.nextSibling);
}
