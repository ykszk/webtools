function clear_color(e)
{
    e.classList.remove('is-warning', 'is-danger');
}

function set_color(e,color)
{
    clear_color(e);
    e.classList.add(color);
}

function update_output()
{
    let script_area = document.getElementById("script_area");
    let output_area = document.getElementById("output_area");
    let input_area = document.getElementById("input_area");
    let input_text = input_area.value;
    let script_text = script_area.value;
    if (input_text === "") {
        output_area.value = "Input is empty";
        set_color(output_area, 'is-danger');
        set_color(input_area, 'is-warning');
        return;
    } else {
        try {
            let s = input_text;
            output_area.value = eval(script_text);
            set_color(output_area, 'is-success');
            clear_color(input_area);
        } catch (error) {
            set_color(output_area, 'is-danger');
            output_area.value = error;
            return;
        }
    }
    encode();
}
function script_changed($this)
{
    update_output();
}

function input_changed($this)
{
    update_output();
}

function title_changed()
{
    var value = document.getElementById("title_area").value;
    if (value === "") {
        document.getElementById("title").innerHTML = "String Processor";
    } else {
        try {
            document.getElementById("title").innerHTML = value + " - String Processor";
        } catch(error) {
            console.log(error);
            return
        }
    }
    encode()
}

function encode()
{
    var params = [["t","title_area"],["s","script_area"]];
    params_str = params.map(name_values => [name_values[0],document.getElementById(name_values[1]).value]).filter(name_values => name_values[1] !== "").map(name_values => name_values[0]+'='+encodeURIComponent(name_values[1])).join("&")
    new_uri = (location.pathname.split('/').pop()+'?'+params_str);
    history.replaceState({},'',new_uri);
}

function decode()
{
    text = location.search.substr(1);
    sep = '&';
    eq = '=';
    params = text.split(sep).filter(e=>e!="").map(e=>e.split(eq)).reduce((pmap,pair)=>{pmap[pair[0]]=pair[1];return pmap},{});
    if (params["t"]) {
        document.getElementById("title_area").value = decodeURIComponent(params["t"]);
    }
    if (params["s"]) {
        document.getElementById("script_area").value = decodeURIComponent(params["s"]);
    }
    title_changed();
}
decode();
