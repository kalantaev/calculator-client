//----/ start constants /----//
// const API_ROOT = 'http://localhost:8080/api';
const API_ROOT = 'http://37.140.198.217:8080';
const IMG_URL = (id) => `/image/${id}`;
const baseColor = "rgb(0,0,255)";
const colorBlack = "rgba(0, 0, 0)";
const colorWhite = "rgb(249,249,249)";
const colorGrey = "rgba(0,0,0,0.41)";
const colorRed = "red";
const imageTextureHeight = 500;
const imageCoeffWidth = 3000 / 12000;
const karkasHeight = 2500;
const doorLength = 800;
const defScaleValue = 8.4;
const defPartitionWidth = 50;
const y3dcefficient = 0.75;

let karkasDepth = 70 / defScaleValue;
let rootDivId;
let cos7 = Math.cos(7.1 * Math.PI / 180);
let cos41 = Math.cos((90 - 41.25) * Math.PI / 180);
let sin7 = Math.sin(7.1 * Math.PI / 180);
let sin41 = Math.sin((90 - 41.25) * Math.PI / 180);
let lowScreen = true;
let textureOuter = [];
let textureFloor = [];
let textureInner = [];
let canvas;
let ctx;
let shapes = [];
let offsetX, offsetY;
let isDragging = false;
let startX, startY;
let selectedShapeId;
let scale = defScaleValue;
let karkas;
let wheel_handle = null;
let id = 1;//todo хз
let allDraging = false;
let accuracy = 4;
let shapesMap = new Map();
let view3D = false;
let titles = {};
let selectOuterValue;
let baseConfig = [];
let windowsEl = [];
let doorsEl = [];
let imageMap = new Map();
let showPrice = true;

//----/ end properties /----//
const price = {
    partition1m: 2.3,
    light: 500,
    door: 3000
};

//----/ start enums /----//
const POSITION = {
    TOP: 'TOP',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};
const DIRECTION = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};
const OPENING_TYPE = {
    IN: 'IN',
    OUT: 'OUT'
};
const HTML_ELEMENT = {
    BUTTON: 'button',
    TABLE: 'table',
    THEAD: 'thead',
    TBODY: 'tbody',
    TH: 'th',
    TR: 'tr',
    TD: 'td',
    DIV: 'div',
    SPAN: 'span',
    H1: 'h1',
    H4: 'h4',
    H6: 'h6',
    IMG: 'img',
    TEXTAREA: 'textarea',
    INPUT: 'input',
    BR: 'br',
    HR: 'hr',
    CHECKBOX: 'checkbox',
}
const SELECT_TEMPLATE_ID = 'templates_select';

//----/ end enums /----//

//**-- textures ---**//

var pol = new Image();
pol.crossOrigin = 'Anonymous';
var pencil = new Image();
pencil.src = "calculator_files/edit.png";
var fon = new Image();
fon.crossOrigin = 'Anonymous';
var vagonka = new Image();
vagonka.crossOrigin = 'Anonymous';

//---------------------- styles --------------------------//
const TEXT_ALIGN_CENTER = 'text-align: center;';
const CURSOR_POINTER = 'cursor: pointer;';
const stylesCss = '.selectable-block:hover{box-shadow: 0 5px 7px 4px #96def4;}' +
    '.selectable-block{display: inline-block;margin: 0 15px 35px 0;vertical-align: top;width: 23%;border-radius: 20px;box-shadow: 0 5px 5px 3px #cecece;text-align: center;padding-bottom: 20px;cursor: pointer}';
let css = document.createElement('style');
css.type = 'text/css';
if (css.styleSheet)
    css.styleSheet.cssText = stylesCss;
else
    css.appendChild(document.createTextNode(stylesCss));

//---------------------- отрисовка html ------------------//

_addControlBtn = (div) => {
    let buttonsId = "canvas_buttons";

    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("id", buttonsId);
    div.insertBefore(buttonDiv, div.children[3]);

    buttonDiv.appendChild(createHtmlElement(HTML_ELEMENT.BUTTON, {
        style: 'margin-right: 5px',
        text: titles['PUBLIC_ADD_PARTITION'],
        onClick: addElement
    }));
    buttonDiv.appendChild(createHtmlElement(HTML_ELEMENT.BUTTON, {
        style: 'margin-right: 5px',
        text: titles['PUBLIC_ADD_OUTER_DOOR'],
        onClick: () => selectDoor(div)
    }));
    buttonDiv.appendChild(createHtmlElement(HTML_ELEMENT.BUTTON, {
        style: 'margin-right: 5px',
        text: titles['PUBLIC_ADD_OUTER_WINDOW'],
        onClick: () => selectWindow(div)
    }));
    buttonDiv.appendChild(createHtmlElement(HTML_ELEMENT.BUTTON, {
        style: 'margin-right: 5px',
        text: titles['PUBLIC_ADD_ELECTRIC'],
        onClick: addLight
    }));

    //3D view
    let view3d = createHtmlElement(HTML_ELEMENT.BUTTON, {text: 'Предпросмотр'});
    view3d.addEventListener("click", function () {
        view3D = !view3D;
        changePositionAndScale();
        drawAll();
        view3D && setTimeout(() => drawAll(), 1000);
    });
    buttonDiv.appendChild(view3d);

    let dawnload = createHtmlElement(HTML_ELEMENT.BUTTON, {text: 'Скачать'});
    dawnload.addEventListener("click", function () {
        canvas.toBlob((b) => saveByteArray(b), 'image/png');
    });
    buttonDiv.appendChild(dawnload);

    let send = createHtmlElement(HTML_ELEMENT.BUTTON, {text: titles['PUBLIC_ORDER_SEND']});
    send.addEventListener("click", function () {
        orderSetting(div);
    });
    buttonDiv.appendChild(send);
};

function orderSetting(root) {
    let div = document.createElement("div");
    div.setAttribute("id", "order-setting-screen");

    let div2 = document.createElement("div");
    div2.setAttribute("id", "full-screen-background");
    div2.setAttribute("style", 'position: fixed;width: 100%;height: 100%;background-color:#040404cc;top: 0%;left: 0%;z-index:499');

    let div3 = document.createElement("div");

    div3.setAttribute("style", 'position: fixed;width: 60%;height: 86%;background-color:white;top: 7%;left: 20%;z-index:501; padding: 25px;');
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        style: TEXT_ALIGN_CENTER,
        text: titles['PUBLIC_ORDER_TITLE']
    }));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H6, {text: titles['PUBLIC_ORDER_INFO']}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {id: 'errors', style: ' color: red', text: ''}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.BR, {}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {text: 'Комментарий'}))

    div3.appendChild(createHtmlElement(HTML_ELEMENT.TEXTAREA, {id: 'orderText'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {text: 'Номер телефона'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.INPUT, {id: 'phone'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.BR, {}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {text: 'Email'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.INPUT, {id: 'email'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.BR, {}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.CHECKBOX, {id: 'send-to-me', style: 'display: inline-block'}))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {
        text: 'Отправить копию обращения на свой email',
        style: 'display: inline-block'
    }))
    div3.appendChild(createHtmlElement(HTML_ELEMENT.HR, {}));

    let send = createHtmlElement(HTML_ELEMENT.BUTTON, {text: 'Отправить'});
    let close = createHtmlElement(HTML_ELEMENT.BUTTON, {text: 'Отмена'});
    close.addEventListener("click", function () {
        removeElement('order-setting-screen');
    });
    send.addEventListener("click", function () {
        let orderText = document.getElementById('orderText').value;
        let phone = document.getElementById('phone').value;
        let email = document.getElementById('email').value;
        let sendToMe = document.getElementById('send-to-me').checked;
        if (!phone) {
            document.getElementById('errors').innerText = titles['PUBLIC_NEED_PHONE_ERROR'];
            return
        }
        if (sendToMe && !email) {
            document.getElementById('errors').innerText = titles['PUBLIC_NEED_EMAIL_ERROR'];
            return
        }
        kalkulatePrice(true);
        let data = {orderText, phone, email, sendToMe, priceTable: document.getElementById('price-block').innerHTML};
        kalkulatePrice();
        removeElement('order-setting-screen');
        view3D = false;
        !lowScreen && setLowScreen();
        canvas.width = 1920;
        canvas.height = 1080;
        changePositionAndScale();
        drawAll();
        canvas.toBlob((b) => sendByteArray(b, data, true), 'image/png');
    });
    div3.appendChild(send);
    div3.appendChild(close);
    div.appendChild(div2);
    div.appendChild(div3);
    root.appendChild(div);
}

function saveByteArray(blob) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'name.png';
    a.click();
    window.URL.revokeObjectURL(url);
};

let rqFile = (url, file) => {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.file = file; // not necessary if you create scopes like this
        xhr.addEventListener('progress', function (e) {
            var done = e.position || e.loaded, total = e.totalSize || e.total;
        }, false);
        if (xhr.upload) {
            xhr.upload.onprogress = function (e) {
                var done = e.position || e.loaded, total = e.totalSize || e.total;
            };
        }
        xhr.onreadystatechange = function (e) {
            if (4 == this.readyState) {
                // console.log(['xhr upload complete', e]);
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.open('post', url, true);
        xhr.send(file);
    });
};

let request = obj => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.timeout = 2000;
        xhr.open(obj.method || "GET", obj.url);
        if (obj.headers) {
            Object.keys(obj.headers).forEach(key => {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                obj.method === 'DELETE' ? resolve() :
                    obj.method === 'POST' ? resolve() :
                        resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(JSON.stringify(obj.body));
    });
};

const requests = {
    del: url =>
        request({url: `${API_ROOT}${url}`}),
    get: url =>
        request({url: `${API_ROOT}${url}`}),
    put: (url, body) =>
        request({
            method: "PUT",
            url: `${API_ROOT}${url}`,
            body: body,
            headers: {"content-type": 'application/json'}
        }),
    post: (url, body) =>
        request({
            method: "POST",
            url: `${API_ROOT}${url}`,
            body: body,
            headers: {'content-type': 'application/json'}
        }),
    delete: (url) =>
        request({
            method: "DELETE",
            url: `${API_ROOT}${url}`
        }).then(() => {
        })
};

let firstImgId;

function sendByteArray(blob, data, first) {
    let formData = new FormData();
    formData.append('content', blob);
    rqFile(API_ROOT + '/file', formData)
        .then(id => {
            try {
                if (first) {
                    view3D = true;
                    changePositionAndScale();
                    drawAll();
                    firstImgId = id;
                    canvas.toBlob((b) => sendByteArray(b, data), 'image/png');
                } else {
                    let id1 = firstImgId;
                    lowScreen && setFullScreenClick();
                    !lowScreen && setLowScreen();
                    firstImgId = undefined;
                    view3D = false;
                    changePositionAndScale();
                    drawAll();
                    requests.post('/order', {imgId: [id1, id], ...data})
                }
            } catch (e) {
                if (!!firstImgId) {
                    let id1 = firstImgId;
                    lowScreen && setFullScreenClick();
                    !lowScreen && setLowScreen();
                    firstImgId = undefined;
                    view3D = false;
                    changePositionAndScale();
                    drawAll();
                    requests.post('/order', {imgId: [id1], ...data})
                } else {
                    alert("При отправке обращения произошла ошибка");
                }
            }
        })
};

const coeff3DX = ((cos41 * cos7 / sin41) + sin7);
const coeff3DY = (cos41 + sin7 * sin41 / cos7);

function changePositionAndScale() {
    if (view3D) {
        let length3D = karkas.getLength() * cos7 + sin41 * karkas.getWidth() * y3dcefficient;
        let width3D = karkas.getWidth() * cos41 * y3dcefficient + sin7 * karkas.getLength() + getHeightPosition(karkas);
        let scale3DLenght = length3D * 1.2 / canvas.width;
        let scale3Dwidth = width3D * 1.2 / canvas.height;
        scale = scale3DLenght > scale3Dwidth ? scale3DLenght : scale3Dwidth;
        let scaled3Dlength = length3D / scale;
        let scaled3DWidth = width3D / scale;
        let y3DTop = (canvas.height - scaled3DWidth) / 2;
        let x3DLeft = ((canvas.width  - scaled3Dlength) / 3);
        karkas.setX(((cos7 * x3DLeft / sin41) - (sin7 * karkas.getLength() / scale) - y3DTop - getHeightPosition(karkas) / scale) / coeff3DX);
        karkas.setY((y3DTop + (sin7 * x3DLeft / cos7) + (sin7 * karkas.getLength() / scale) + getHeightPosition(karkas) / scale) / coeff3DY);
    } else {
        let is24x24 = karkas.getLength() === 2400 && karkas.getWidth() === 2400;
        let calculatedScale1 = (karkas.getLength() + getScaleValue(getArrowShift(karkas, POSITION.LEFT)[0]) + (is24x24 ? 1000 : 0)) / (canvas.width * 0.8);
        let calculatedScale2 = (karkas.getWidth() + getScaleValue(getArrowShift(karkas, POSITION.TOP)[0]) + (is24x24 ? 1000 : 0)) / (canvas.height * 0.8);
        scale = calculatedScale2 >= calculatedScale1 ? calculatedScale2 : calculatedScale1;
        karkas.setX((canvas.width - karkas.getLength() / scale) / 2);
        karkas.setY((canvas.height - karkas.width / scale) / 2);
    }
    drawAll();
}

setDeffWidthCanvas = (div) => {
    canvas.width = div.parentElement.clientWidth;
    canvas.height = canvas.width / 1.525;
};

_renderCanvas = (div) => {

    _addControlBtn(div);

//создаем холст для рисования
    canvas = document.createElement("canvas");
//рисовать будем в двух плоскостях
    ctx = canvas.getContext("2d");

//устанавливаем размеры холсту
    setDeffWidthCanvas(div);
//добавляем холст на страницу
    div.appendChild(canvas);


    if (canvas.addEventListener) canvas.addEventListener("DOMMouseScroll", mouse_wheel, false);
    canvas.onmousewheel = document.onmousewheel = mouse_wheel;
    set_handle(canvas, handleMouseWheelUp);

    reOffset();

    window.onscroll = function (e) {
        e.preventDefault();
        e.stopPropagation();
        reOffset();
    };
    window.onresize = function (e) {
        reOffset();
    };
    canvas.onresize = function (e) {
        reOffset();
    };
// listen for mouse events
    canvas.onmousedown = handleMouseDown;
    canvas.onmousemove = handleMouseMove;
    canvas.touchmove = handleMouseMove;
    canvas.onmouseup = handleMouseUp;
    canvas.onmouseout = handleMouseOut;
    canvas.onmouseWheelUp = handleMouseWheelUp;
    canvas.touchstart = handleMouseDown;
    canvas.touchend = handleMouseUp;


//двойной клик
//     canvas.addEventListener('dblclick', function (e) {
//         e.preventDefault();
//         e.stopPropagation();
//         startX = parseInt(e.clientX - offsetX);
//         startY = parseInt(e.clientY - offsetY);
//         for (var i = 0; i < shapes.length; i++) {
//             if (isMouseInShape(startX, startY, shapes[i])) {
//                 shapes[i].fixed = false;
//                 drawAll()
//             }
//         }
//     });

    deserialize();
    if (shapes && shapes.length != 0) {
        let buttonsId = "canvas_buttons";
        removeElement(buttonsId);
        _addControlBtn(div);
    }
    drawAll();
    reOffset();
};

function createDivWindow(div, el, windowId) {
    let divWindow = createHtmlElement(HTML_ELEMENT.SPAN, {
        classV: 'selectable-block', onClick: () => {
            if (windowId) {
                let shapeById = getShapeById(windowId);
                shapeById.price = shapeById.base && shapeById.initId === el.id ? undefined : el.price;
                shapeById.hint = el.name;
                shapeById.image3D = el.image3D;
                shapeById.length = el.length;
                shapeById.settingId = el.id;
            } else {
                addWindow(el, windowId);
            }
            serialize();
            removeElement('select-window-screen');
            drawAll()
        }
    });
    if (el.imageSelect) {
        let image = imageMap.get(el.imageSelect);
        image.setAttribute('style', 'height: 150px;cursor: pointer')
        divWindow.appendChild(image);
    }
    divWindow.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {html: windowNameTmpl(el)}));
    div.appendChild(divWindow);
}

function createDivDoor(div, el, imgSrc, imgName, length, price, name, doorId, base, parentId, inner) {
    let divWindow = createHtmlElement(HTML_ELEMENT.SPAN, {
        classV: 'selectable-block', onClick: () => {
            if (inner && parentId) {
                let parent = getShapeById(parentId);
                let door = new InnerDoor(parent, price, name, el);
                parent.doorId.push(door.getId());
            } else {
                if (doorId) {
                    let shapeById = getShapeById(doorId);
                    shapeById.price = shapeById.base && shapeById.initId === el.id ? undefined : price;
                    shapeById.printName = name;
                    shapeById.length = el.length;
                    shapeById.settingId = el.id;
                    shapeById.height = el.height;
                    shapeById.image3D = el.image3D;
                } else {
                    addDoor(el.length, price, name, el);
                }
            }
            serialize();
            removeElement('select-window-screen');
            drawAll();
        }
    });
    if (el.imageSelect) {
        let image = imageMap.get(el.imageSelect);
        image.setAttribute('style', 'height: 150px;cursor: pointer');
        divWindow.appendChild(image);
    }
    divWindow.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {html: imgName}));
    div.appendChild(divWindow);
}

selectWindow = (root, windowId) => {
    let div = document.createElement("div");
    div.setAttribute("id", "select-window-screen");

    let div2 = document.createElement("div");
    div2.setAttribute("id", "full-screen-background");
    div2.setAttribute("style", 'position: fixed;width: 100%;height: 100%;background-color:#040404cc;top: 0%;left: 0%;z-index:499');

    let div3 = document.createElement("div");

    div3.setAttribute("style", 'position: fixed;width: 60%;height: 86%;background-color:white;top: 7%;left: 20%;z-index:501; padding: 25px;');
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H4, {style: TEXT_ALIGN_CENTER, text: 'Выберете окно'}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        style: 'float: right; margin-top: -50px; cursor: pointer',
        text: 'х',
        onClick: () => removeElement('select-window-screen')
    }));

    windowsEl.forEach(item => {
        createDivWindow(div3, item, windowId);
    });
    div.appendChild(div2);
    div.appendChild(div3);
    root.appendChild(div);
};

selectDoor = (root, doorId, inner, parentId) => {
    let div = document.createElement("div");
    div.setAttribute("id", "select-window-screen");

    let div2 = document.createElement("div");
    div2.setAttribute("id", "full-screen-background");
    div2.setAttribute("style", 'position: fixed;width: 100%;height: 100%;background-color:#040404cc;top: 0%;left: 0%;z-index:499');

    let div3 = document.createElement("div");

    div3.setAttribute("style", 'position: fixed;width: 60%;height: 86%;background-color:white;top: 7%;left: 20%;z-index:501; padding: 25px;');
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H4, {style: TEXT_ALIGN_CENTER, text: 'Выберете дверь'}));
    div3.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        style: 'float: right; margin-top: -50px; cursor: pointer',
        text: 'х',
        onClick: () => removeElement('select-window-screen')
    }));

    doorsEl.filter(item => (inner && item.inner) || (!inner && item.outer)).forEach(item => {
        createDivDoor(div3, item, item.image, doorNameTmpl(item.name, item.price), item.length, item.price, item.name, doorId, item.base, parentId, inner);
    });
    div.appendChild(div2);
    div.appendChild(div3);
    root.appendChild(div);
};

let windowNameTmpl = (item) => `<br/><b>${item.name || ('Окно ' + item.length + 'x' + item.width + 'мм ')}<br/><span style="color: #0c7abf">${item.price} руб.</span></b>`;
let doorNameTmpl = (name, prise) => `<br/><b>${name}<br/><span style="color: #0c7abf">${prise} руб.</span></b>`;

setFullScreen = () => {
    lowScreen = false;

    let root = document.getElementById(rootDivId);
    root.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {
        id: "full-screen-background",
        style: 'position: fixed;width: 100%;height: 100%;background-color:#040404cc;top: 0%;left: 0%;z-index:499'
    }));
    let div = createHtmlElement(HTML_ELEMENT.DIV, {
        id: "full-screen",
        style: 'position: fixed;width: 86%;height: 86%;background-color:white;top: 7%;left: 8%;z-index:500'
    });
    let lowScreenBtn = createHtmlElement(HTML_ELEMENT.IMG, {
        src: 'static/low-screen.png',
        width: '30px',
        style: 'float: right; cursor: pointer'
    });
    lowScreenBtn.addEventListener("click", function () {

        setLowScreen();

    });
    div.appendChild(lowScreenBtn);
    root.appendChild(div);
    _renderCanvas(div);
    canvas.width = div.clientWidth;
    canvas.height = div.clientHeight * 0.85;
    changePositionAndScale();

};

setLowScreen = () => {
    serialize();
    lowScreen = true;
    removeElement("full-screen");
    removeElement("full-screen-background");
    renderCalculator();
    create();
    deserialize();
    changePositionAndScale();
};

function removeElement(id) {
    var elem = document.getElementById(id);
    if (elem) {
        return elem && elem.parentNode.removeChild(elem);
    }
}

requests.get("/getSettings").then(rs => {
    rs && rs.forEach(item => {
        if (item.key === 'PUBLIC_SHOW_PRICE') {
            showPrice = item.value === '1'
        }
        titles[item.key] = item.value
    });
});

window.onload = () => renderCalculator('canvas');

renderCalculator = (idElement) => {
    _renderCalculator(idElement)
};

_renderCalculator = (idElement) => {
    if (idElement) {
        rootDivId = idElement;
    }
    let div = createHtmlElement(HTML_ELEMENT.DIV, {id: "low-screen"});

    div.appendChild(createHtmlElement(HTML_ELEMENT.H1, {style: TEXT_ALIGN_CENTER, text: titles.PUBLIC_APP_TITLE}));
    let divNew = createHtmlElement(HTML_ELEMENT.DIV, {id: 'select-karkas-to-create'});
    divNew.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        style: TEXT_ALIGN_CENTER,
        text: titles.PUBLIC_SELECT_BASE_TYPE
    }));
    baseConfig.forEach(k => {
        divNew.appendChild(divCreateNew(k))
    });
    div.appendChild(divNew);
    if ((sessionStorage.getItem('shapes') !== 'undefined' && sessionStorage.getItem('shapes') !== null)) {
        let divContiny = createHtmlElement(HTML_ELEMENT.DIV, {id: 'contyny-create'});
        divContiny.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
            style: TEXT_ALIGN_CENTER,
            text: 'Продолжите ранее начатый проект'
        }));
        divContiny.appendChild(divContyny());
        div.appendChild(divContiny);
    }
    let divTmp = createHtmlElement(HTML_ELEMENT.DIV, {id: 'create-from-tmplate'});
    getKarkasTemlateToCreate().length > 0 && divTmp.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        style: TEXT_ALIGN_CENTER,
        text: 'Выберете существующий тип и измените под свои нужды'
    }));
    getKarkasTemlateToCreate().forEach(k => {
        divTmp.appendChild(divCreateTmp(k))
    });
    div.appendChild(divTmp);
    document.getElementById(rootDivId).appendChild(div);
};

function divCreateNew(item) {
    let div = createHtmlElement(HTML_ELEMENT.SPAN, {
        classV: 'selectable-block', onClick: () => {
            create();
            setKarkas(item);
        }
    });
    item.img && div.appendChild(createHtmlElement(HTML_ELEMENT.IMG, {src: item.img, width: '200px'}));
    div.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        text: item.name,
        style: TEXT_ALIGN_CENTER + 'padding-top:10px'
    }));
    div.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {
        text: 'Цена: ' + item.price + 'руб.',
        style: TEXT_ALIGN_CENTER
    }));
    return div;
}

function divContyny() {
    let div = createHtmlElement(HTML_ELEMENT.SPAN, {
        classV: 'selectable-block', onClick: () => {
            create();
            deserialize();
        }
    });

    div.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        text: 'Продолжить',
        style: TEXT_ALIGN_CENTER + 'padding-top:10px'
    }));
    return div;
}

function divCreateTmp(item) {
    let div = createHtmlElement(HTML_ELEMENT.SPAN, {
        classV: 'selectable-block', onClick: () => {
            create();
            createFromTemplate(item.data);
        }
    });
    item.img && div.appendChild(createHtmlElement(HTML_ELEMENT.IMG, {
        src: item.img,
        width: '200px',
        style: 'padding-top:15px'
    }));
    div.appendChild(createHtmlElement(HTML_ELEMENT.H4, {
        text: item.name,
        style: TEXT_ALIGN_CENTER + 'padding-top:10px;padding-bottom: 0 !important;'
    }));
    item.p && div.appendChild(createHtmlElement(HTML_ELEMENT.DIV, {
        text: 'Цена: ' + item.p + 'руб.',
        style: TEXT_ALIGN_CENTER
    }));
    return div;
}

function create() {
    removeElement('select-karkas-to-create');
    removeElement('contyny-create');
    removeElement('create-from-tmplate');
    let fullScreenBtn = createHtmlElement(HTML_ELEMENT.IMG, {
        id: 'full-scr-btn',
        src: 'static/full-screen.png',
        width: '30px',
        style: 'float: right; cursor: pointer',
        onClick: setFullScreenClick
    });
    let screen = document.getElementById("low-screen");
    screen.insertBefore(createHtmlElement(HTML_ELEMENT.DIV, {
        style: 'cursor:pointer',
        id: 'back-to-select',
        text: "\u2190 Назад",
        onClick: returnToSelect
    }), screen.children[0]);
    screen && screen.insertBefore(fullScreenBtn, screen.children[1]);
    _renderCanvas(screen);
}

returnToSelect = () => {
    initElement();
    requests.get('/base-config').then(rs => {
        baseConfig = rs;
        removeElement('low-screen');
        removeElement('full-scr-btn');
        removeElement('back-to-select');
        removeElement('price-block');
        removeElement('select-texture-block');
        view3D = false;
        _renderCalculator()
    });
};

/**
 * Получение возможных шаблонов //todo получать с сервера
 */
function getKarkasTemlateToCreate() {
    return [] /*templates*/
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function initElement() {
    let rs = JSON.parse(httpGet(`${API_ROOT}/getAllElement`));
    if (rs) {
        windowsEl = [];
        doorsEl = [];
        rs.forEach(el => {
            if (el.image3D) {
                let img = new Image();
                img.src = API_ROOT + IMG_URL(el.image3D);
                img.crossOrigin = 'Anonymous';
                imageMap.set(el.image3D, img);
            }
            if (el.imageSelect) {
                let img = new Image();
                img.src = API_ROOT + IMG_URL(el.imageSelect);
                img.crossOrigin = 'Anonymous';
                imageMap.set(el.imageSelect, img);
            }
            switch (el.elementType) {
                case "WINDOW":
                    windowsEl.push(el);
                    break;
                case "DOOR":
                    doorsEl.push(el);
                    break;
            }
        })
    }
}

function setFullScreenClick() {
    serialize();
    removeElement("low-screen");
    setFullScreen();
}

function createHtmlElement(type, {id, style, src, width, text, onClick, classV, html}) {
    let element = type === HTML_ELEMENT.CHECKBOX ? document.createElement(HTML_ELEMENT.INPUT) : document.createElement(type);
    if (type === HTML_ELEMENT.CHECKBOX) {
        element.setAttribute("type", 'checkbox');
    }
    if (id) {
        element.setAttribute("id", id);
    }
    if (style) {
        element.setAttribute("style", style);
    }
    if (classV) {
        element.setAttribute("class", classV);
    }
    if (src) {
        element.setAttribute("src", src);
    }
    if (width) {
        element.setAttribute("width", width);
    }
    if (text) {
        element.innerText = text;
    }
    if (html) {
        element.innerHTML = html;
    }
    if (onClick) {
        element.addEventListener("click", function () {
            onClick()
        });
    }
    return element;
}

//-------------------------------------------end -------------------------/

// ------------------------------ Обработка html кнопок  -------------//

addElement = () => {
    if (karkas) {
        confirmAllShapes();
        const defPartitionLength = (karkas.getLength() / 3);
        var x = karkas.x + ((karkas.getLength() / 4) - (defPartitionLength / 2)) / scale;
        var y = karkas.y - /*(parent.width /6) / scale*/ getScaleValue(40);
        if (shapes.filter(item => item.name === 'Partition' && item.x === x && item.y === y).length === 0) {
            new Arrow(new Partition(karkas), POSITION.TOP, colorBlack);
        }
        drawAll();
    }
};

addLight = () => {
    if (karkas) {
        confirmAllShapes();
        new Light(karkas);
        drawAll();
    }
};

addDoor = (length, price, name, el) => {
    if (karkas) {
        confirmAllShapes();
        new Arrow(new Door(karkas, length, price, name, el), POSITION.TOP, colorBlack);
        drawAll();
    }
};

addWindow = (data) => {
    if (karkas) {
        confirmAllShapes();
        new Arrow(new Window(karkas, data), POSITION.BOTTOM, colorBlack);
        drawAll();
    }
};

initTextures = (baseConfig, isNew) => {
    if(baseConfig) {
        textureFloor = initTexture(baseConfig.elements, 'TEXTURE_FLOOR', pol, isNew);
        textureInner = initTexture(baseConfig.elements, 'TEXTURE_INNER', vagonka, isNew);
        textureOuter = initTexture(baseConfig.elements, 'TEXTURE_OUTER', fon, isNew);
    }
};

initTexture = (texturesIn, type, img, isNew) => {
    let textures = texturesIn ? texturesIn.map(i => ({
        ...i,
        element: {...i.element, def: i.def, price: i.price}
    })).filter(i => i.elementType === type).map(i => i.element) : [];
    if (textures.length !== 0) {
        let filter = textures.filter(i => i.def);
        if (filter.length === 0) {
            filter = textures;
        }
        karkas[type] = !karkas[type] ? filter[0] : karkas[type];
        isNew && (img.src = API_ROOT + IMG_URL(filter[0].imageSelect));
    }
    return textures;
};

setKarkas = (baseConfig) => {
    shapes = [];
    scale = defScaleValue;
    let wall = baseConfig.walls && baseConfig.walls.filter(i => i.def)[0];
    karkasDepth = (wall && wall.depth || 70) / defScaleValue;
    karkas = new Karkas(100, 70, baseConfig);
    initTextures(baseConfig, true);
    karkas.wall = wall;
    new Arrow(karkas, POSITION.TOP, colorBlack, baseConfig.width + " мм");
    new Arrow(karkas, POSITION.LEFT, colorBlack, baseConfig.height + " мм");
    baseConfig.elements && baseConfig.elements.forEach(baseElement => {
        switch (baseElement.elementType) {
            case 'WINDOW':
                let window = new Window(karkas, baseElement.element);
                window.price = undefined;
                window.base = true;
                window.initId = baseElement.element.id;
                window.settingId = baseElement.element.id;

                if (baseElement.position) {
                    window.position = baseElement.position;
                }
                if (baseElement.shift) {
                    window.shift = baseElement.shift;
                }
                new Arrow(window, baseElement.position || POSITION.BOTTOM, colorBlack);
                break;
            case 'DOOR':
                let door = new Door(karkas);
                door.price = undefined;
                door.base = true;
                door.initId = baseElement.element.id;
                door.settingId = baseElement.element.id;
                door.height = baseElement.element.height;
                door.image3D = baseElement.element.image3D;
                let arrowPosition = POSITION.TOP;
                if (baseElement.position) {
                    door.position = baseElement.position;
                    switch (baseElement.position) {
                        case POSITION.LEFT:
                            arrowPosition = POSITION.RIGHT;
                            break;
                        case POSITION.TOP:
                            arrowPosition = POSITION.BOTTOM;
                            break;
                        case POSITION.RIGHT:
                            arrowPosition = POSITION.LEFT;
                            break;
                        case POSITION.BOTTOM:
                            arrowPosition = POSITION.TOP;
                            break;

                    }
                }
                if (baseElement.shift) {
                    door.shift = baseElement.shift;
                }
                new Arrow(door, arrowPosition, colorBlack);
                break;
            default:
                return;
        }
    });
    changePositionAndScale();
    drawAll();
    serialize()
};

function getBaseConfigById(id) {
    return baseConfig.filter(i => i.id === id)[0];
}

//-------------------------------------------end -------------------------/

// ------------------------------ Классы элементов конструктора  -------------//

function generateIdAndPushToShape(shape) {
    shape.id = uuidv4();
    shapesMap.set(shape.id, shape);
    shapes.push(shape)
}

/**
 * Базоывй класс фигур для отрисовки
 *
 */
class Shape {
    /**
     * Идентификатор фигуры
     */
    id;
    /**
     * Координата х верхней левой точки
     */
    x;
    /**
     * Координата у верхней левой точки
     */
    y;
    /**
     * Ширина элемента
     */
    width;
    /**
     * Высота элемента
     */
    height;
    /**
     * Длина элемента
     */
    length;
    /**
     * Цвет линии элемента
     */
    color;
    /**
     * Текст который относится к фигуре
     */
    text;
    /**
     * Признак, что элемент не перетаскивается
     */
    notDragable;
    /**
     * Признак что данная фигура зафиксирована
     */
    fixed;
    /**
     * Признак удаления, при следующем рендере данная фигура удаляется
     */
    deleted;
    /**
     * Наименоние фигуры
     * @type {string}
     */
    name = 'Shape';

    settingId;

    parentId;

    arrowsId = [];

    constructor(x, y, length, width, color, text, notDragable) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
        this.color = color;
        this.text = text;
        this.notDragable = !!notDragable;
        this.fixed = true;
        generateIdAndPushToShape(this);
    }

    getParent() {
        let parent;
        if (this.parentId) {
            parent = shapesMap.get(this.parentId)
        }
        return parent;
    }

    getX() {
        return this.x;
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        return this.getY()
    }

    getY() {
        return this.y;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    getLength() {
        return this.length;
    }

    getWidth() {
        return this.width;
    }

    setLength(length) {
        this.length = length;
    }

    setWidth(width) {
        this.width = width;
    }

    draw = function (ctx) {
        console.info("Method draw not implemented")
    };

    getId = () => {
        return this.id;
    };

    onClick = () => {
        console.info("Method onClick not implemented");
    };

    confirm = () => {

    };

    turn = () => {
        turnShape(this)
    };

    mirroring = () => {
    };

    setDeleted() {
        shapes.filter(item => item.parentId === this.getId()).forEach(item => item.setDeleted());
        setDeleteAllShapeInArrId(this.relatedShapes);
        setDeleteAllShapeInArrId(this.arrowsId);
        this.deleted = true;
    }

    sort = (a, b) => {
        return a.getX() - b.getX();
    };
}

class RelatedShape extends Shape {
    _shiftX;
    _shiftY;

    constructor(parent, _shiftX, _shiftY) {
        super();
        this.parentId = parent && parent.getId();
        this._shiftX = _shiftX;
        this._shiftY = _shiftY;
    }


    /**
     * used
     * @see Rectangle
     */
    static createTurnButton(shape, _shiftX, _shiftY) {
        let btn = new TurnButton(shape, _shiftX, _shiftY);
        return btn.getId();
    }

    static createConfirmButton(shape, shiftX, shiftY) {
        let btn = new ConfirmButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    /**
     * used
     * @see Rectangle
     */
    static createDeleteButton(shape, shiftX, shiftY) {
        let btn = new DeleteButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    static createEditButton(shape, shiftX, shiftY) {
        let btn = new EditButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    static createChangeSizeElement(shape, isFirst) {
        let btn = new ChangeSizeElement(shape);
        btn.isFirst = isFirst;
        return btn.getId();
    }

    static createDragElement(shape, shiftX, shiftY) {
        let btn = new DragElement(shape, shiftX, shiftY);
        return btn.getId();
    }

    /**
     * used
     * @see Door
     */
    static createMirrorButton(shape, shiftX, shiftY) {
        let btn = new MirrorButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    /**
     * used
     * @see Rectangle
     */
    static createAddDoorButton(shape, shiftX, shiftY) {
        let btn = new AddInnerDoorButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    /**
     * used
     * @see Door
     */
    static createChangeOpenButton(shape, shiftX, shiftY) {
        let btn = new ChangeOpenTypeButton(shape, shiftX, shiftY);
        return btn.getId();
    }

    getShiftX() {
        return this._shiftX;
    }

    setShiftX(value) {
        this._shiftX = value;
    }

    getShiftY() {
        return this._shiftY;
    }

    setShiftY(value) {
        this._shiftY = value;
    }
}

class Door extends Shape {

    relatedShapes = [];
    shift = 25;
    position = POSITION.BOTTOM;
    direction = DIRECTION.RIGHT;
    opening = OPENING_TYPE.OUT;
    name = "Door";
    nameRu = 'дверь';
    price = 5000;
    printName;

    constructor(parent, length, price, name, el) {
        if (parent) {
            var x = parent.x + ((parent.getLength() / 2) - (doorLength / 2)) / scale;
            var y = parent.y - karkasDepth + (parent.width) / scale;
            super(x, y, length || doorLength, karkasDepth, colorBlack);
            this.shift = this.calculateShift(x, parent);
            this.parentId = parent.getId();
            this.price = price;
            this.printName = name;
            this.settingId = el && el.id;
            this.image3D = el && el.image3D;
            this.height = el && el.height
        } else {
            super();
        }
    }

    calculateShift(x, parent, shift) {
        shift = shift || ((x - parent.x) / (parent.getLength() / scale)) * 100;
        if (shapes.filter(filterBottomDoor).filter(item => Math.abs(item.shift - shift) < 5).length > 0) {
            shift = this.calculateShift(x, parent, shift > 80 ? 1 : shift + 13.5)
        }
        return shift;
    }

    getLength() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return doorLength;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return karkasDepth;
        }
        return doorLength;
    }

    getWidth() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return karkasDepth;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return doorLength;
        }
        return karkasDepth;
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentX = parent.getX();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    return (shift / 100) * parentLength + parentX;
                case POSITION.RIGHT:
                    return parentX + parentLength - (karkasDepth * defScaleValue / scale);
                case POSITION.LEFT:
                    return parentX;
            }
        }
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() * y3dcefficient / scale;
            let parentY = parent.getY();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY + karkasDepth * defScaleValue * y3dcefficient / scale - (karkasDepth * y3dcefficient / scale);
                case POSITION.BOTTOM:
                    return parentY + parentWidth - (karkasDepth * y3dcefficient / scale);
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentY = parent.getY();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY;
                case POSITION.BOTTOM:
                    return parentY + parentWidth - (karkasDepth * defScaleValue / scale);
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    setX(x) {
        let parent = this.getParent();
        if (parent) {
            let parentX = parent.getX();
            let parentLength = parent.getLength();
            let parentWidth = parent.getWidth() / scale;
            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    if (parentX + karkasDepth < x && (parentX - karkasDepth + parentLength / scale) > (x + this.getLength() / scale)) {
                        this.shift = ((x - parentX) / (parentLength / scale)) * 100
                    } else if ((parentX + parentLength / scale) < mouseX) {
                        this.shift = this.position === POSITION.TOP ? karkasDepth * 100 / parentWidth : ((parentWidth - karkasDepth - this.getLength() / scale) / parentWidth) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.LEFT);
                        this.position = POSITION.RIGHT;
                        this.revertSize()
                    } else if (parentX > mouseX) {
                        this.shift = this.position === POSITION.TOP ? karkasDepth * 100 / parentWidth : ((parentWidth - karkasDepth - this.getLength() / scale) / parentWidth) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.RIGHT);
                        this.position = POSITION.LEFT;
                        this.revertSize()
                    }
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
            }
        }
    }

    setY(y) {
        let parent = this.getParent();
        if (parent) {
            let parentY = parent.getY();
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;

            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    if (parentY + karkasDepth < y && (parentY - karkasDepth + parentWidth) > (y + this.width / scale)) {
                        this.shift = ((y - parentY) / parentWidth) * 100
                    } else if ((parentY + parentWidth) < mouseY) {
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.TOP);
                        this.shift = this.position === POSITION.LEFT ? karkasDepth * 100 / parentLength : ((parentLength - karkasDepth - this.getWidth() / scale) / parentLength) * 100;
                        this.position = POSITION.BOTTOM;
                        this.revertSize()
                    } else if (parentY > mouseY) {
                        this.shift = this.position === POSITION.LEFT ? karkasDepth * 100 / parentLength : ((parentLength - karkasDepth - this.getWidth() / scale) / parentLength) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.BOTTOM);
                        this.position = POSITION.TOP;
                        this.revertSize()
                    }
            }
        }

    }

    revertSize() {
        let width = this.width;
        this.width = this.length;
        this.length = width;
        this.confirm();
        this.fixed = false;
        drawAll()
    }

    confirm = () => {
        this.fixed = true;
        this.relatedShapes.forEach(item => shapes.filter(i => i.id === item)[0].deleted = true);
        this.relatedShapes = [];
    };
    edit = () => {
        selectDoor(document.getElementById(rootDivId), this.getId())
    };

    draw = function (ctx) {
        if (!this.fixed && this.relatedShapes.length == 0) {
            switch (this.position) {
                case POSITION.BOTTOM:
                case POSITION.TOP:
                    !this.base && this.relatedShapes.push(RelatedShape.createDeleteButton(this, -getScaleValue(40), -getScaleValue(35)));
                    this.base && this.relatedShapes.push(RelatedShape.createEditButton(this, -getScaleValue(40), -getScaleValue(35)));
                    this.relatedShapes.push(RelatedShape.createMirrorButton(this, -getScaleValue(10), -getScaleValue(35)));
                    this.relatedShapes.push(RelatedShape.createChangeOpenButton(this, getScaleValue(20), -getScaleValue(35)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, (this.getLength() / 2 / scale), karkasDepth / 2));
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    !this.base && this.relatedShapes.push(RelatedShape.createDeleteButton(this, getScaleValue(15), getScaleValue(15)));
                    this.base && this.relatedShapes.push(RelatedShape.createEditButton(this, getScaleValue(15), getScaleValue(15)));
                    this.relatedShapes.push(RelatedShape.createMirrorButton(this, getScaleValue(15), getScaleValue(15)));
                    this.relatedShapes.push(RelatedShape.createChangeOpenButton(this, getScaleValue(15), getScaleValue(40)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, karkasDepth / 2, (this.getWidth() / 2 / scale)));
                    break;
            }
        }
        //фигура
        // ctx.save();
        switch (this.position) {
            case POSITION.BOTTOM:
                drawGorizontalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() * defScaleValue / scale,
                    this.opening,
                    this.direction);
                break;
            case POSITION.TOP:
                drawGorizontalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() * defScaleValue / scale,
                    this.opening == OPENING_TYPE.OUT ? OPENING_TYPE.IN : OPENING_TYPE.OUT,
                    this.direction == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT);
                break;
            case POSITION.LEFT:
                drawVertikalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() * defScaleValue / scale,
                    this.getWidth() / scale,
                    this.opening == OPENING_TYPE.OUT ? OPENING_TYPE.IN : OPENING_TYPE.OUT,
                    this.direction == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT);
                break;
            case POSITION.RIGHT:
                drawVertikalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() * defScaleValue / scale,
                    this.getWidth() / scale,
                    this.opening,
                    this.direction);
                break;
            default:
                break;
        }


        return this;
    };

    mirroring = () => {
        switch (this.direction) {
            case DIRECTION.LEFT:
                this.direction = DIRECTION.RIGHT;
                break;
            case DIRECTION.RIGHT:
                this.direction = DIRECTION.LEFT;
        }
    };

    changeOpen = () => {
        let arrow = getShapeById(this.arrowsId[0]);
        switch (this.opening) {
            case OPENING_TYPE.IN:
                this.opening = OPENING_TYPE.OUT;
                if (arrow) {
                    switch (arrow.type) {
                        case "BOTTOM":
                            arrow.type = POSITION.TOP;
                            break;
                        case "TOP":
                            arrow.type = POSITION.BOTTOM;
                            break;
                        case POSITION.LEFT:
                            arrow.type = POSITION.RIGHT;
                            break;
                        case POSITION.RIGHT:
                            arrow.type = POSITION.LEFT;
                            break;
                    }
                }
                break;
            case OPENING_TYPE.OUT:
                this.opening = OPENING_TYPE.IN;
                if (arrow) {
                    switch (arrow.type) {
                        case "BOTTOM":
                            arrow.type = POSITION.TOP;
                            break;
                        case "TOP":
                            arrow.type = POSITION.BOTTOM;
                            break;
                        case POSITION.LEFT:
                            arrow.type = POSITION.RIGHT;
                            break;
                        case POSITION.RIGHT:
                            arrow.type = POSITION.LEFT;
                            break;
                    }
                }
        }
    }
}

class InnerDoor extends Shape {

    relatedShapes = [];
    shift = 25;
    direction = DIRECTION.RIGHT;
    opening = OPENING_TYPE.OUT;
    position = POSITION.BOTTOM;
    name = "InnerDoor";
    nameRu = 'дверь';
    printName;

    constructor(parent, price, name, el) {
        if (parent) {
            let width = parent.getWidth() / scale;
            let length = parent.getLength() / scale;
            let isGorizontal = length > width;
            let x = parent.x + ((parent.getLength() / 4) - (doorLength / 2)) / scale;
            let y = parent.y - karkasDepth + (parent.width) / scale;
            super(x, y, doorLength, defPartitionWidth, colorBlack);
            this.shift = 50;
            this.parentId = parent.getId();
            this.position = isGorizontal ? POSITION.BOTTOM : POSITION.RIGHT;
            this.price = price;
            this.printName = name;
            this.hint = name;
            this.height = el.height;
            this.image3D = el.image3D;
            this.settingId = el.id
        } else {
            super();
        }
    }

    getLength() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return doorLength;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return defPartitionWidth;
        }
    }

    getWidth() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return defPartitionWidth;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return doorLength;
        }
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentX = parent.getX();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    return (shift / 100) * parentLength + parentX;
                case POSITION.RIGHT:
                    return parentX + parentLength - (defPartitionWidth / scale);
                case POSITION.LEFT:
                    return parentX;
            }
        }
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() * y3dcefficient / scale;
            let parentY = parent.getY3D();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY;
                case POSITION.BOTTOM:
                    return parentY + parentWidth - defPartitionWidth / scale;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentY = parent.getY();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY;
                case POSITION.BOTTOM:
                    return parentY + parentWidth - defPartitionWidth / scale;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    setX(x) {
        let parent = this.getParent();
        if (parent) {
            let parentX = parent.getX();
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    if (parentX < x && (parentX + parentLength) > (x + this.getLength() / scale)) {
                        this.shift = ((x - parentX) / parentLength) * 100
                    }
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
            }
        }
    }

    setY(y) {
        let parent = this.getParent();
        if (parent) {
            let parentY = parent.getY();
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    if (parentY < y && (parentY + parentWidth) > (y + this.getWidth() / scale)) {
                        this.shift = ((y - parentY) / parentWidth) * 100
                    }
            }
        }
    }

    revertSize() {
        let width = this.width;
        this.width = this.length;
        this.length = width;
        this.confirm();
        this.fixed = false;
        drawAll()
    }

    confirm = () => {
        this.fixed = true;
        this.relatedShapes.forEach(item => shapes.filter(i => i.id === item)[0].deleted = true);
        this.relatedShapes = [];
    };

    draw = function (ctx) {
        if (!this.fixed && this.relatedShapes.length == 0) {
            switch (this.position) {
                case POSITION.BOTTOM:
                case POSITION.TOP:
                    this.relatedShapes.push(RelatedShape.createDeleteButton(this, -getScaleValue(40), this.opening === OPENING_TYPE.IN ? -getScaleValue(30) : getScaleValue(20)));
                    this.relatedShapes.push(RelatedShape.createMirrorButton(this, -getScaleValue(10), this.opening === OPENING_TYPE.IN ? -getScaleValue(30) : getScaleValue(20)));
                    this.relatedShapes.push(RelatedShape.createChangeOpenButton(this, getScaleValue(20), this.opening === OPENING_TYPE.IN ? -getScaleValue(30) : getScaleValue(20)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, (this.getLength() / 2 / scale) + getScaleValue(60), this.opening === OPENING_TYPE.IN ? -getScaleValue(20) : getScaleValue(30)));
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    this.relatedShapes.push(RelatedShape.createDeleteButton(this, this.opening == OPENING_TYPE.OUT ? getScaleValue(30) : -getScaleValue(30), getScaleValue(25)));
                    this.relatedShapes.push(RelatedShape.createMirrorButton(this, this.opening == OPENING_TYPE.OUT ? getScaleValue(30) : -getScaleValue(30), getScaleValue(54)));
                    this.relatedShapes.push(RelatedShape.createChangeOpenButton(this, this.opening == OPENING_TYPE.OUT ? getScaleValue(30) : -getScaleValue(30), getScaleValue(35)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, this.opening == OPENING_TYPE.OUT ? getScaleValue(40) : -getScaleValue(20), (this.getWidth() / 2 / scale) - getScaleValue(25)));
                    break;
            }
        }
        //фигура
        // ctx.save();
        switch (this.position) {
            case POSITION.BOTTOM:
                drawGorizontalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() / scale,
                    this.opening,
                    this.direction, true);
                break;
            case POSITION.TOP:
                drawGorizontalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() / scale,
                    this.opening == OPENING_TYPE.OUT ? OPENING_TYPE.IN : OPENING_TYPE.OUT,
                    this.direction == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT, true);
                break;
            case POSITION.LEFT:
                drawVertikalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() / scale,
                    this.opening == OPENING_TYPE.OUT ? OPENING_TYPE.IN : OPENING_TYPE.OUT,
                    this.direction == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT);
                break;
            case POSITION.RIGHT:
                drawVertikalDoor(ctx,
                    this.getX(),
                    this.getY(),
                    this.getLength() / scale,
                    this.getWidth() / scale,
                    this.opening,
                    this.direction);
                break;
            default:
                break;

        }


        return this;
    };

    mirroring = () => {
        switch (this.direction) {
            case DIRECTION.LEFT:
                this.direction = DIRECTION.RIGHT;
                break;
            case DIRECTION.RIGHT:
                this.direction = DIRECTION.LEFT;
        }
    };

    changeOpen = () => {
        let arrow = getShapeById(this.arrowsId[0]);
        switch (this.opening) {
            case OPENING_TYPE.IN:
                this.opening = OPENING_TYPE.OUT;
                arrow && (arrow.type = POSITION.TOP);
                break;
            case OPENING_TYPE.OUT:
                this.opening = OPENING_TYPE.IN;
                arrow && (arrow.type = POSITION.BOTTOM);
        }
    }
}

class Window extends Shape {

    relatedShapes = [];
    shift = 25;
    position = POSITION.BOTTOM;
    name = 'Window';
    nameRu = 'окно';
    price;

    constructor(parent, data) {
        if (parent) {
            let karkasDepth1 = karkasDepth * defScaleValue / scale;
            var x = parent.getX() + ((parent.getLength() / 4) - (data.length / 2)) / scale;
            var y = parent.getY() - karkasDepth1 + (parent.getWidth()) / scale;
            super(x, y, data.length, karkasDepth1, colorBlack);
            this.shift = this.calculateShift(x, parent);
            this.position = POSITION.BOTTOM;
            this.parentId = parent.getId();
            this.price = data.price;
            this.height = data.height;
            this.hint = data.name;
            this.image3D = data.image3D;
            this.settingId = data.id;
        } else {
            super()
        }
        // this.positionTop = ((y - parent.y)/ (parent.width / scale)) * 100;
    }

    calculateShift(x, parent, shift) {
        shift = shift || ((x - parent.getX()) / (parent.getLength() / scale)) * 100;
        if (shapes.filter(filterBottomWindow).filter(item => Math.abs(item.shift - shift) < 5).length > 0) {
            shift = this.calculateShift(x, parent, shift > 80 ? 1 : shift + 13.5)
        }
        return shift;
    }

    getLength() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return this.length;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return karkasDepth;
        }
        return this.length;
    }

    getWidth() {
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                return karkasDepth;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                return this.length;
        }
        return karkasDepth;
    }

    getX() {
        let parent = this.getParent();
        if (!!parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentX = parent.getX();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    return (shift / 100) * parentLength + parentX;
                case POSITION.RIGHT:
                    return parentX + parentLength - (karkasDepth * defScaleValue / scale);
                case POSITION.LEFT:
                    return parentX;
            }
        }
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        let parent = this.getParent();
        if (parent) {
            let parentWidth = parent.getWidth() * y3dcefficient / scale;
            let parentY = parent.getY();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY + karkasDepth * defScaleValue * y3dcefficient / scale - (karkasDepth * y3dcefficient / scale);
                case POSITION.BOTTOM:
                    return parentY + parentWidth - (karkasDepth * y3dcefficient / scale);
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;
            let parentY = parent.getY();
            let shift = this.shift;

            switch (this.position) {
                case POSITION.TOP:
                    return parentY;
                case POSITION.BOTTOM:
                    return parentY + parentWidth - (karkasDepth * defScaleValue / scale);
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    return (shift / 100) * parentWidth + parentY;
            }
        }
    }

    setX(x) {
        let parent = this.getParent();
        if (parent) {
            let parentX = parent.getX();
            let parentLength = parent.getLength();
            let parentWidth = parent.getWidth() / scale;
            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    if (parentX + karkasDepth < x && (parentX - karkasDepth + parentLength / scale) > (x + this.getLength() / scale)) {
                        this.shift = ((x - parentX) / (parentLength / scale)) * 100
                    } else if ((parentX + parentLength / scale) < mouseX) {
                        this.shift = this.position === POSITION.TOP ? karkasDepth * 100 / parentWidth : ((parentWidth - karkasDepth - this.getLength() / scale) / parentWidth) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.RIGHT);
                        this.position = POSITION.RIGHT;
                    } else if (parentX > mouseX) {
                        this.shift = this.position === POSITION.TOP ? karkasDepth * 100 / parentWidth : ((parentWidth - karkasDepth - this.getLength() / scale) / parentWidth) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.LEFT);
                        this.position = POSITION.LEFT;
                    }
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
            }
        }
    }

    setY(y) {
        let parent = this.getParent();
        if (parent) {
            let parentY = parent.getY();
            let parentLength = parent.getLength() / scale;
            let parentWidth = parent.getWidth() / scale;

            switch (this.position) {
                case POSITION.TOP:
                case POSITION.BOTTOM:
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    if (parentY + karkasDepth < y && (parentY - karkasDepth + parentWidth) > (y + this.width / scale)) {
                        this.shift = ((y - parentY) / parentWidth) * 100
                    } else if ((parentY + parentWidth) < mouseY) {
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.BOTTOM);
                        this.shift = this.position === POSITION.LEFT ? karkasDepth * 100 / parentLength : ((parentLength - karkasDepth - this.getWidth() / scale) / parentLength) * 100;
                        this.position = POSITION.BOTTOM;
                    } else if (parentY > mouseY) {
                        this.shift = this.position === POSITION.LEFT ? karkasDepth * 100 / parentLength : ((parentLength - karkasDepth - this.getWidth() / scale) / parentLength) * 100;
                        let arrow = getShapeById(this.arrowsId[0]);
                        arrow && (arrow.type = POSITION.TOP);
                        this.position = POSITION.TOP;
                    }
            }
        }

    }

    confirm = () => {
        this.fixed = true;
        this.relatedShapes.forEach(item => shapes.filter(i => i.id === item)[0] && (shapes.filter(i => i.id === item)[0].deleted = true));
        this.relatedShapes = [];
    };

    draw = function (ctx) {
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        if (!this.fixed && this.relatedShapes.length == 0) {
            switch (this.position) {
                case POSITION.BOTTOM:
                case POSITION.TOP:
                    !this.base && this.relatedShapes.push(RelatedShape.createDeleteButton(this, -getScaleValue(40), -getScaleValue(35)));
                    this.base && this.relatedShapes.push(RelatedShape.createEditButton(this, -getScaleValue(40), -getScaleValue(35)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, (this.getLength() / 2 / scale), karkasDepth / 2));
                    break;
                case POSITION.RIGHT:
                case POSITION.LEFT:
                    !this.base && this.relatedShapes.push(RelatedShape.createDeleteButton(this, getScaleValue(15), getScaleValue(15)));
                    this.base && this.relatedShapes.push(RelatedShape.createEditButton(this, getScaleValue(15), getScaleValue(15)));
                    this.relatedShapes.push(RelatedShape.createDragElement(this, karkasDepth / 2, (this.getWidth() / 2 / scale)));
                    break;
            }
        }
        //фигура
        switch (this.position) {
            case POSITION.BOTTOM:
            case POSITION.TOP:
                drawGorizontalWindow(this.getX(), this.getY(), this.getLength() / scale, karkasDepth1);
                break;
            case POSITION.LEFT:
            case POSITION.RIGHT:
                drawVertikalWindow(this.getX(), this.getY(), this.getWidth() / scale, karkasDepth1);
                break;
            default:
                break;
        }

        return this;
    };

    edit = () => {
        selectWindow(document.getElementById(rootDivId), this.getId())
    };
}

/**
 * Фигура для поворота фигуры, круглая стрелка
 */
class TurnButton extends RelatedShape {

    name = 'TurnButton';
    hint = "Повернуть на 90 градусов";

    constructor(parent, shiftX = 30, shiftY = -34) {
        super(parent, shiftX, shiftY);
    }

    /**
     * У данной фигуры фиксированная ширина
     * @returns {number}
     */
    getLength() {
        return getScaleValue(20);
    }

    /**
     * У данной фигуры фиксированная высота
     * @returns {number}
     */
    getWidth() {
        return getScaleValue(20);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            let length = parent.getLength() / scale;
            return parent.getX() + length / 2 + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            let width = parent.getWidth() / scale;
            return parent.getY() + width / 2 + this.getShiftY()
        }
    }

    draw = function (ctx) {
        // // раскоментировать для отображения области
        // ctx.beginPath();
        // ctx.rect(this.getX(), this.getY(), this.getLength(), this.getWidth());
        // ctx.strokeStyle = 'rgba(0,0,0,0.23)';
        // ctx.stroke();
        // ctx.closePath();

        let value10 = getScaleValue(8);
        let value3 = getScaleValue(2);
        let value7 = getScaleValue(7);
        let value5 = getScaleValue(5);
        let value1 = getScaleValue(1);

        let centerX = this.getX() + this.getLength() / 2;
        let centerY = this.getY() + this.getWidth() / 2;

        ctx.beginPath();


        ctx.strokeStyle = 'rgb(5,223,82)';
        ctx.arc(centerX, centerY, value10, 1, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(centerX + value10, centerY - value1);
        ctx.lineTo(centerX + value3, centerY - value5);
        ctx.moveTo(centerX + value10, centerY - value1);
        ctx.lineTo(centerX + value7, centerY - value10);
        ctx.lineTo(centerX + value3, centerY - value5);
        ctx.strokeStyle = 'rgb(5,223,82)';
        ctx.fillStyle = 'rgb(5,223,82)';
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    };

    onClick = () => {
        let parent = this.getParent();
        parent && parent.turn && parent.turn();
        drawAll();
    }

}

/**
 * Кнопка для подтверждения, галка
 */
class ConfirmButton extends RelatedShape {

    name = 'ConfirmButton';
    hint = "Закрепить элемент";

    constructor(shape, shiftX, shiftY) {
        if (!shiftX) shiftX = -10;
        if (!shiftY) shiftY = -30;
        super(shape, shiftX, shiftY);
        this.hint = `Закрепить ${shape.nameRu !== undefined ? shape.nameRu : 'элемент'}`;
        this.color = colorRed
    }

    getLength() {
        return 25;
    }

    getWidth() {
        return 20;
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + this.getShiftY()
        }
    }


    draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.getX() + 10, this.getY() + 20);
        ctx.lineTo(this.getX(), this.getY() + 10);
        ctx.moveTo(this.getX() + 10, this.getY() + 20);
        ctx.lineTo(this.getX() + 25, this.getY());
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
    };

    onClick = () => {
        let parent = this.getParent();
        parent && parent.confirm && parent.confirm();
        serialize();
        drawAll();
    }
}

/**
 * Кнопка для подтверждения, галка
 */
class DeleteButton extends RelatedShape {

    name = 'DeleteButton';
    hint = "Удалить элемент";

    constructor(shape, shiftX, shiftY) {
        if (!shiftX) shiftX = 65;
        if (!shiftY) shiftY = -30;
        super(shape, shiftX, shiftY);
        this.hint = `Удалить ${shape.nameRu !== undefined ? shape.nameRu : 'элемент'}`;
        this.color = colorRed
    }

    getLength() {
        return getScaleValue(14);
    }

    getWidth() {
        return getScaleValue(14);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + (parent.getWidth() / 2 / scale) + this.getShiftY()
        }
    }

    draw = function (ctx) {
        drawWhiteRectangle(this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.beginPath();
        ctx.moveTo(this.getX(), this.getY());
        ctx.lineTo(this.getX() + this.getLength(), this.getY() + this.getWidth());
        ctx.moveTo(this.getX() + this.getLength(), this.getY());
        ctx.lineTo(this.getX(), this.getY() + this.getWidth());
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
    };

    onClick = () => {
        this.deleted = true;
        let parent = this.getParent();
        parent && parent.setDeleted && parent.setDeleted();
        serialize();
        drawAll();
    }
}

class EditButton extends RelatedShape {

    name = 'EditButton';
    hint = "Редактировать элемент";

    constructor(shape, shiftX, shiftY) {
        if (!shiftX) shiftX = 65;
        if (!shiftY) shiftY = -30;
        super(shape, shiftX, shiftY);
        this.hint = `Изменить ${shape.nameRu !== undefined ? shape.nameRu : 'элемент'}`;
        this.color = baseColor
    }

    getLength() {
        return getScaleValue(18);
    }

    getWidth() {
        return getScaleValue(18);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + (parent.getWidth() / 2 / scale) + this.getShiftY()
        }
    }

    draw = function (ctx) {
        ctx.drawImage(pencil, this.getX(), this.getY(), this.getLength(), this.getWidth());
    };

    onClick = () => {
        let parent = this.getParent();
        parent && parent.edit && parent.edit();
        serialize();
        drawAll();
    }
}

/**
 * Кнопка для отзеркаливания
 */
class MirrorButton extends RelatedShape {

    name = 'MirrorButton';
    hint = "Левая/правая";

    constructor(shape, shiftX, shiftY) {
        if (!shiftX) shiftX = 65;
        if (!shiftY) shiftY = -30;
        super(shape, shiftX, shiftY);
        this.color = colorBlack
    }

    getLength() {
        return getScaleValue(15);
    }

    getWidth() {
        return getScaleValue(15);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + this.getShiftY()
        }
    }

    draw = function (ctx) {

        drawWhiteRectangle(this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.beginPath();
        drawMirror(ctx, this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
    };

    onClick = () => {
        let parent = this.getParent();
        parent && parent.mirroring && parent.mirroring();
        serialize();
        drawAll();
    }
}

/**
 * Кнопка для добавления двери на внутреннюю перегородку
 */
class AddInnerDoorButton extends RelatedShape {

    name = 'AddInnerDoorButton';
    hint = "Добавить дверь";

    constructor(shape, shiftX = 65, shiftY = -30) {
        super(shape, shiftX, shiftY);
        this.color = colorBlack
    }

    getLength() {
        return getScaleValue(14);
    }

    getWidth() {
        return getScaleValue(16);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + (parent.getWidth() / 2 / scale) + this.getShiftY()
        }
    }

    draw = function (ctx) {
        ctx.beginPath();
        drawAddDoor(ctx, this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
    };

    onClick = () => {
        let parent = this.getParent();
        if (parent) {
            selectDoor(document.getElementById(rootDivId), false, true, parent.getId());
        }
    }
}

/**
 * Кнопка для изменения типа открытия двери
 */
class ChangeOpenTypeButton extends RelatedShape {

    name = 'ChangeOpenTypeButton';
    hint = "Наружняя/внутренняя";

    constructor(shape, shiftX, shiftY) {
        if (!shiftX) shiftX = 65;
        if (!shiftY) shiftY = -30;
        super(shape, shiftX, shiftY);
        this.color = colorBlack
    }

    getLength() {
        return getScaleValue(15);
    }

    getWidth() {
        return getScaleValue(15);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + (parent.getLength() / 2 / scale) + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + this.getShiftY()
        }
    }

    draw = function (ctx) {
        drawWhiteRectangle(this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.beginPath();
        drawChangeOpen(ctx, this.getX(), this.getY(), this.getLength(), this.getWidth());
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
    };

    onClick = () => {
        let parent = this.getParent();
        parent && parent.changeOpen && parent.changeOpen();
        serialize();
        drawAll();
    }
}

class DragElement extends RelatedShape {

    WIDTH = 20;
    HEIGHT = 20;
    hint = "Перемещение элемента";

    constructor(shape, shiftX, shiftY) {
        super(shape, shiftX - getScaleValue(20 / 2), shiftY - getScaleValue(20 / 2));
        this.color = colorBlack;
        this.hint = `Переместить ${shape.nameRu !== undefined ? shape.nameRu : 'элемент'}`;
    }

    name = "DragElement";

    getLength() {
        return getScaleValue(this.WIDTH);
    }

    getWidth() {
        return getScaleValue(this.HEIGHT);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return parent.getX() + this.getShiftX();
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return parent.getY() + this.getShiftY()
        }
    }

    setY(y) {
        let parent = this.getParent();
        if (parent) {
            parent.setY(y - this.getShiftY());
        }
    }

    setX(x) {
        let parent = this.getParent();
        if (parent) {
            parent.setX(x - this.getShiftX());
        }
    }

    draw = function (ctx) {
        let parent = this.getParent();
        if (parent) {
            ctx.save()
            ctx.beginPath();
            //крестик
            drawCross(ctx, this.getX(), this.getY(), this.getLength(), this.getWidth());
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            drawTopArrow(ctx, this.getX() + this.getLength() / 2, this.getY(), 4, 7);
            drawBottomArrow(ctx, this.getX() + this.getLength() / 2, this.getY() + this.getWidth(), 4, 7);
            drawLeftArrow(ctx, this.getX(), this.getY() + this.getWidth() / 2, 7, 4);
            drawRightArrow(ctx, this.getX() + this.getLength(), this.getY() + this.getWidth() / 2, 7, 4);
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            if (isDragging && (selectedShapeId === this.getId() || selectedShapeId === this.parentId)) {
                ctx.beginPath();
                if (parent instanceof Door || parent instanceof Window) {
                    if (parent.position === POSITION.BOTTOM) {

                        let karkasX = parent.getParent().getX();
                        let karkasY = parent.getParent().getY();
                        let karkasWidth = parent.getParent().getWidth() / scale;
                        let karkasLength = parent.getParent().getLength() / scale;

                        let dragElementX = parent.getX();
                        let dragElementLength = parent.getLength() / scale;
                        ctx.moveTo(karkasX, karkasY + karkasWidth);
                        ctx.lineTo(karkasX, karkasY + karkasWidth + (130 * 5 / scale));
                        ctx.moveTo(karkasX, karkasY + karkasWidth + 120 * 5 / scale);
                        ctx.lineTo(dragElementX, karkasY + karkasWidth + 120 * 5 / scale);
                        ctx.moveTo(dragElementX, karkasY + karkasWidth + 130 * 5 / scale);
                        ctx.lineTo(dragElementX, karkasY + karkasWidth);

                        ctx.fillStyle = "rgba(0,0,0,0.18)";
                        ctx.font = "italic 18pt Arial";
                        let text = parseInt((dragElementX - karkasX) * scale) + " мм";
                        ctx.fillText(text, karkasX + (dragElementX - karkasX) / 2, karkasY + karkasWidth + 90 * 5 / scale);

                        ctx.moveTo(karkasX + karkasLength, karkasY + karkasWidth);
                        ctx.lineTo(karkasX + karkasLength, karkasY + karkasWidth + 130 * 5 / scale);
                        ctx.moveTo(karkasX + karkasLength, karkasY + karkasWidth + 120 * 5 / scale);
                        ctx.lineTo(dragElementX + dragElementLength, karkasY + karkasWidth + 120 * 5 / scale);
                        ctx.moveTo(dragElementX + dragElementLength, karkasY + karkasWidth + 130 * 5 / scale);
                        ctx.lineTo(dragElementX + dragElementLength, karkasY + karkasWidth);

                        text = parseInt((karkasX + karkasLength - dragElementX - dragElementLength) * scale) + " мм";
                        ctx.fillText(text, dragElementX + dragElementLength + (karkasX + karkasLength - dragElementX - dragElementLength) / 2,
                            karkasY + karkasWidth + 90 * 5 / scale);
                    }
                }
                if (parent instanceof Light) {


                    let karkasX = parent.getParent().getX();
                    let elX = parent.getX() + parent.getLength() / 2 / scale;
                    let karkasY = parent.getParent().getY();
                    let elY = parent.getY() + parent.getLength() / 2 / scale;

                    let karkasWidth = parent.getParent().getWidth() / scale;
                    let karkasLength = parent.getParent().getLength() / scale;

                    let dragElementX = parent.getX();
                    let dragElementY = parent.getY();
                    let dragElementLength = parent.getLength() / scale;
                    let dragElementWidth = parent.getWidth() / scale;

                    ctx.moveTo(karkasX, elY);
                    ctx.lineTo(dragElementX, elY);
                    ctx.setLineDash([20, 10]);

                    ctx.fillStyle = colorGrey;
                    ctx.font = "italic 18pt Arial";
                    let text = parseInt((dragElementX - karkasX) * scale) + " мм";
                    ctx.fillText(text, karkasX + (dragElementX - karkasX) / 2, elY - 50 / scale);

                    ctx.moveTo(karkasX + karkasLength, elY);
                    ctx.lineTo(dragElementX + dragElementLength, elY);
                    text = parseInt((karkasX + karkasLength - dragElementX - dragElementLength) * scale) + " мм";
                    ctx.fillText(text, dragElementX + dragElementLength + (karkasX + karkasLength - dragElementX - dragElementLength) / 2,
                        elY - 50 / scale);

                    ctx.moveTo(elX, karkasY);
                    ctx.lineTo(elX, karkasY + karkasWidth);

                    text = parseInt((dragElementX - karkasX) * scale) + " мм";
                    ctx.strokeStyle = "rgba(0,0,0,0.18)";
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();

                    ctx.translate(elX, elY);
                    ctx.rotate(270 * Math.PI / 180);
                    text = parseInt((dragElementY - karkasY) * scale) + " мм";
                    ctx.fillText(text, (dragElementY - karkasY) / 2 - text.length * 7 / 2, -20);


                    text = parseInt((karkasY + karkasWidth - dragElementY - dragElementWidth) * scale) + " мм";
                    ctx.fillText(text, -(karkasY + karkasWidth - dragElementY + dragElementWidth) / 2 - text.length * 7 / 2, -20);

                }
                ctx.strokeStyle = "rgba(0,0,0,0.18)";
                ctx.stroke();

                ctx.closePath();
            }

            ctx.restore()
        }
    };

}

class Rectangle extends Shape {

    relatedShapes = [];
    name = 'Rectangle';

    doorId = [];
    price;

    constructor(x, y, length, width, color, notDragable, price) {
        super(x, y, length, width, color, undefined, !!notDragable);
        this.price = price;
    }

    confirm = () => {
        this.fixed = true;
        setDeleteAllShapeInArrId(this.relatedShapes)
        this.relatedShapes = [];
    };

    draw = function (ctx) {
        if (!this.fixed && this.relatedShapes.length == 0) {
            let doors = this.getDoorsIfExist();
            let width = this.getWidth() / scale;
            let length = this.getLength() / scale;
            let isGorizontal = length > width;
            let scaleCoeff = defScaleValue / scale;
            let val3 = (3 * scaleCoeff > 3) ? 3 : 3 * scaleCoeff;
            let val34 = (34 * scaleCoeff > 34) ? 34 : 34 * scaleCoeff;
            let val35 = (35 * scaleCoeff > 35) ? 35 : 35 * scaleCoeff;
            let val30 = (30 * scaleCoeff > 30) ? 30 : 30 * scaleCoeff;
            let needAddDoor = (isGorizontal ? (this.getLength() > doorLength) : (this.getWidth() > doorLength));

            this.relatedShapes.push(RelatedShape.createDragElement(this, this.getLength() / 2 / scale, this.getWidth() / 2 / scale));
            this.relatedShapes.push(RelatedShape.createChangeSizeElement(this, true));
            this.relatedShapes.push(RelatedShape.createChangeSizeElement(this, false));
            let shifts = [];
            if (doors.length > 0) {
                if (isGorizontal) {
                    shifts = doors[0].opening === OPENING_TYPE.IN ? [{x: 3, y: 15}, {x: 35, y: 18}, {x: -25, y: 18}] :
                        [{x: 3, y: undefined}, {x: 35, y: undefined}, {x: -25, y: -31}];
                } else {
                    shifts = doors[0].opening === OPENING_TYPE.IN ? [{x: 19, y: -15}, {x: 20, y: 19}, {
                        x: 24,
                        y: -45
                    }] : [{x: -35, y: -15}, {x: -30, y: 19}, {x: -30, y: -45}];
                }
            } else {
                shifts = isGorizontal ? [{x: 3, y: -34}, {x: 35, y: -30}, {x: -25, y: -31}] :
                    [{x: 19, y: -15}, {x: 20, y: 19}, {x: 24, y: -45}];
            }
            this.relatedShapes.push(RelatedShape.createTurnButton(this,
                getScaleValue(Math.abs(shifts[0].x)) * shifts[0].x / Math.abs(shifts[0].x),
                !shifts[0].y ? undefined : getScaleValue(Math.abs(shifts[0].y)) * shifts[0].y / Math.abs(shifts[0].y)));
            this.relatedShapes.push(RelatedShape.createDeleteButton(this,
                getScaleValue(Math.abs(shifts[1].x)) * shifts[1].x / Math.abs(shifts[1].x),
                !shifts[1].y ? undefined : getScaleValue(Math.abs(shifts[1].y)) * shifts[1].y / Math.abs(shifts[1].y)));
            needAddDoor && this.relatedShapes.push(RelatedShape.createAddDoorButton(this,
                getScaleValue(Math.abs(shifts[2].x)) * shifts[2].x / Math.abs(shifts[2].x),
                !shifts[2].y ? undefined : getScaleValue(Math.abs(shifts[2].y)) * shifts[2].y / Math.abs(shifts[2].y)));
        }
        let color = this.color;
        //предупреждение при пересечении//todo написать метод пресечения фигур
        shapes.forEach(item => {
            if (!(item instanceof Karkas) &&
                item.getId() !== this.getId() &&
                this.relatedShapes.indexOf(item.getId()) === -1 &&
                (!selectedShapeId || selectedShapeId === this.getId()) &&
                isMouseInShape(this.getX(), this.getY(), item)) {
                color = colorRed;
            }
        });

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.getX(), this.getY(), (this.getLength()) / scale, this.getWidth() / scale);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        return this;
    };

    getDoorsIfExist() {
        let doors = [];
        if (this.doorId.length > 0) {
            doors = shapes.filter(item => this.doorId.indexOf(item.getId()) !== -1);
        }
        return doors;
    }
}

class Partition extends Rectangle {

    positionTop;
    positionRight;
    name = 'Partition';
    nameRu = 'перегородку';
    price;


    constructor(parent) {
        if (parent) {
            const defPartitionLength = (parent.getLength() / 3);
            var x = parent.x + ((parent.getLength() / 4) - (defPartitionLength / 2)) / scale;
            var y = parent.y - /*(parent.width /6) / scale*/ getScaleValue(40);
            super(x, y, defPartitionLength, defPartitionWidth, baseColor);
            this.parentId = parent.getId();
            this.positionRight = ((x - parent.x) / (parent.getLength() / scale)) * 100;
            this.positionTop = ((y - parent.y) / (parent.width / scale)) * 100;
            this.price = round(defPartitionLength * price.partition1m, 2);
            this.height = 2500;
        } else {
            super()
        }
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return (this.positionRight / 100) * parent.getLength() / scale + parent.x;
        }
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        let parent = this.getParent();
        if (parent) {
            return (this.positionTop / 100) * parent.width * y3dcefficient / scale + parent.y;
        }
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return (this.positionTop / 100) * parent.width / scale + parent.y;
        }
    }

    setX(x) {
        this.x = x;
        let parent = this.getParent();
        let thisLength = this.getLength() / scale;
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        if (parent) {
            if (parent.x + karkasDepth1 < x && (parent.x - karkasDepth1 + parent.getLength() / scale) > (x + thisLength)) {
                this.positionRight = ((x - parent.x) / (parent.getLength() / scale)) * 100;
            } else if (parent.x + karkasDepth1 >= x) {
                this.positionRight = (karkasDepth1 / (parent.getLength() / scale)) * 100;
            } else {
                this.positionRight = (((parent.getLength() / scale) - karkasDepth1 - thisLength) / (parent.getLength() / scale)) * 100;
            }
            let magnetShapeX1 = magnetShapeX(this);
            if (magnetShapeX1) {
                this.setX(this.getX() + magnetShapeX1)
            }
        }
    }

    setY(y) {
        this.y = y;
        let parent = this.getParent();
        let thisWidth = this.getWidth() / scale;
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        if (parent) {
            if (parent.y + karkasDepth1 < y && (parent.y - karkasDepth1 + parent.width / scale) > (y + thisWidth)) {
                this.positionTop = ((y - parent.y) / (parent.width / scale)) * 100;
            } else if (parent.y + karkasDepth1 >= y) {
                this.positionTop = (karkasDepth1 / (parent.width / scale)) * 100;
            } else {
                this.positionTop = (((parent.width / scale) - karkasDepth1 - thisWidth) / (parent.width / scale)) * 100;
            }
        }
    }

    resize(dx, dy, isLeft) {
        let parent = this.getParent();
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        let doors = this.getDoorsIfExist();
        let minLength = doors.length > 0 ? (doorLength + 40) * doors.length : 100;
        if (parent) {
            if (this.getLength() > this.width) {
                if (isLeft) {
                    let length = this.getLength() - dx * scale;
                    if (length > minLength) {
                        if (this.getX() > parent.getX() + karkasDepth1 || dx > 0) {
                            this.positionRight = ((this.getX() + dx - parent.x) / (parent.getLength() / scale)) * 100;
                            this.length -= dx * scale;
                        } else {
                            this.positionRight = ((karkasDepth1 / (parent.getLength() / scale))) * 100;
                        }
                    }
                } else {
                    if ((this.getX() - parent.getX() + karkasDepth1 + (this.getLength() + dx * scale) / scale) * scale < parent.getLength()) {
                        let length = this.getLength() + dx * scale;
                        if (length > minLength) this.length = length;
                    }
                }
                this.price = round(this.getLength(), 2) * price.partition1m
            } else {
                if (isLeft) {
                    let width = this.width - dy * scale;
                    if (width > minLength) {
                        if (this.getY() > parent.getY() + karkasDepth1 || dy > 0) {
                            this.positionTop = ((this.getY() + dy - parent.getY()) / (parent.width / scale)) * 100;
                            this.width -= dy * scale;
                        } else {
                            this.positionTop = ((karkasDepth1 / (parent.width / scale))) * 100;
                        }
                    }
                } else {
                    if ((this.getY() - parent.getY() + karkasDepth1 + (this.getWidth() + dy * scale) / scale) * scale < parent.getWidth()) {
                        let width = this.width + dy * scale;
                        if (width > minLength) this.width += dy * scale;
                    }
                }
                this.price = round(this.width, 2) * price.partition1m
            }
            let innerParentWidth = (((parent.getWidth()) / scale) - karkasDepth1 * 2) * scale;

            if (this.getWidth() + karkasDepth * 2 >= innerParentWidth) {
                setDeleteAllShapeInArrId(this.arrowsId);
                this.arrowsId = [];
            } else {
                if (this.arrowsId.length === 0) {
                    new Arrow(this, POSITION.LEFT, colorBlack);
                }
            }
        }
    }

    turn = () => {
        turnShape(this);
        let parent = this.getParent();
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        let innerParentWidth = (((parent.getWidth()) / scale) - karkasDepth1 * 2) * scale;
        if (parent) {
            if (this.getWidth() + karkasDepth * 2 > innerParentWidth) {
                this.width = innerParentWidth;
                setDeleteAllShapeInArrId(this.arrowsId);
            }
        }
        this.confirm();
        this.fixed = false;
        this.getDoorsIfExist().forEach(door => {
            door.position = door.position === POSITION.BOTTOM ? POSITION.RIGHT : POSITION.BOTTOM;
        });
        this.setX(this.getX());
        this.setY(this.getY())
    };

}

class Light extends Shape {
    relatedShapes = [];
    positionTop;
    positionRight;
    name = 'Light';
    nameRu = 'светильник';
    price = price.light;

    constructor(parent) {
        if (parent) {
            var x = parent.x + (parent.getLength() / 4) / scale;
            var y = parent.y + (parent.width / 2) / scale;
            super(x, y, 200, 200, colorGrey);
            this.parentId = parent.getId();
            try {
                this.positionRight = this.calculateShift(x, parent);
            } catch (e) {
                this.positionRight = ((x - parent.x) / (parent.getLength() / scale)) * 100 + Math.random() * 20;
            }
            this.positionTop = ((y - parent.y) / (parent.width / scale)) * 100 - 5;
        } else {
            super()
        }
    }

    calculateShift(x, parent, shift) {
        shift = shift || ((x - parent.x) / (parent.getLength() / scale)) * 100;
        if (shapes.filter(item => item.name === 'Light').filter(item => Math.abs(item.positionRight - shift) < 5).length > 0) {
            shift = this.calculateShift(x, parent, shift > 80 ? 1 : shift + 10)
        }
        return shift;
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return (this.positionRight / 100) * parent.getLength() / scale + parent.x;
        }
    }

    getX3D() {
        return this.getX()
    }

    getY3D() {
        return this.getY()
    }

    getY() {
        let parent = this.getParent();
        if (parent) {
            return (this.positionTop / 100) * parent.width / scale + parent.y;
        }
    }

    setX(x) {
        let parent = this.getParent();
        let thisLength = this.getLength() / scale;
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        if (parent) {
            if (parent.x + karkasDepth1 < x && (parent.x - karkasDepth1 + parent.getLength() / scale) > (x + thisLength)) {
                this.positionRight = ((x - parent.x) / (parent.getLength() / scale)) * 100;
            } else if (parent.x + karkasDepth1 >= x) {
                this.positionRight = (karkasDepth1 / (parent.getLength() / scale)) * 100;
            } else {
                this.positionRight = (((parent.getLength() / scale) - karkasDepth1 - thisLength) / (parent.getLength() / scale)) * 100;
            }
            // let magnetShapeX1 = magnetShapeX(this);
            // if (magnetShapeX1) {
            //     this.setX(this.getX() + magnetShapeX1)
            // }
        }
    }

    setY(y) {
        let parent = this.getParent();
        let thisWidth = this.getWidth() / scale;
        let karkasDepth1 = karkasDepth * defScaleValue / scale;
        if (parent) {
            if (parent.y + karkasDepth1 < y && (parent.y - karkasDepth1 + parent.width / scale) > (y + thisWidth)) {
                this.positionTop = ((y - parent.y) / (parent.width / scale)) * 100;
            } else if (parent.y + karkasDepth1 >= y) {
                this.positionTop = (karkasDepth1 / (parent.width / scale)) * 100;
            } else {
                this.positionTop = (((parent.width / scale) - karkasDepth1 - thisWidth) / (parent.width / scale)) * 100;
            }
        }
    }

    confirm = () => {
        this.fixed = true;
        setDeleteAllShapeInArrId(this.relatedShapes);
        this.relatedShapes = [];
    };

    draw = function (ctx) {
        if (!this.fixed && this.relatedShapes.length == 0) {
            this.relatedShapes.push(RelatedShape.createDragElement(this, this.getLength() / 2 / scale, this.getWidth() / 2 / scale));
            this.relatedShapes.push(RelatedShape.createDeleteButton(this, 15, -7));
        }

        let color = this.color;
        ctx.save();
        ctx.beginPath();
        let centerX = this.getX() + this.getLength() / scale / 2;
        let centerY = this.getY() + this.getLength() / scale / 2;
        ctx.arc(centerX, centerY, this.getLength() / 2 / scale, 0, 2 * Math.PI);
        let crossLenght = (this.getLength() - 50) / 2 / scale;
        ctx.moveTo(centerX - crossLenght, centerY - crossLenght);
        ctx.lineTo(centerX + crossLenght, centerY + crossLenght);
        ctx.moveTo(centerX + crossLenght, centerY - crossLenght);
        ctx.lineTo(centerX - crossLenght, centerY + crossLenght);
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.closePath();
        ctx.restore();

        return this;
    };

}

class Karkas extends Rectangle {

    name = 'Karkas';
    nameRu = 'Каркас';

    constructor(x, y, setting) {

        if (setting) {
            super(x, y, setting.width, setting.height, baseColor, true, setting.price);
            this.price = setting.price;
            this.settingId = setting.id;
            this.color = baseColor;
            this.height = 2500;
            this.colorButtomLine = setting.colorButtomLine;
            this.bottomLineHeight = setting.bottomLineHeight
        } else {
            super();
        }
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    getWidth() {
        let baseConfigById = getBaseConfigById(this.settingId);
        return baseConfigById && baseConfigById.height || this.height;
    }

    getLength() {
        let baseConfigById = getBaseConfigById(this.settingId);
        return baseConfigById && baseConfigById.width || this.width;
    }

    getPrice() {
        let baseConfigById = getBaseConfigById(this.settingId);
        return baseConfigById && baseConfigById.price || this.price;
    }

    draw = function (ctx) {

        let karkasDepth1 = karkasDepth * defScaleValue / scale;

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.getX(), this.getY(), (this.getLength()) / scale, this.getWidth() / scale);
        ctx.rect(this.getX() + karkasDepth1, this.getY() + karkasDepth1, ((this.getLength()) / scale) - karkasDepth1 * 2, (this.getWidth() / scale) - karkasDepth1 * 2);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        //верхняя пунктирная
        ctx.moveTo(this.getX() - 35, this.getY() + karkasDepth1 / 2);
        ctx.lineTo(this.getX() + (this.getLength() / scale) + 35, this.getY() + karkasDepth1 / 2);
        //нижняя пунктирная
        ctx.moveTo(this.getX() - 35, this.getY() + this.getWidth() / scale - karkasDepth1 + karkasDepth1 / 2);
        ctx.lineTo(this.getX() + (this.getLength() / scale) + 35, this.getY() + this.getWidth() / scale - karkasDepth1 + karkasDepth1 / 2);
        //левая пунктирная
        ctx.moveTo(this.getX() + karkasDepth1 / 2, this.getY() - 35);
        ctx.lineTo(this.getX() + karkasDepth1 / 2, this.getY() + (this.getWidth() / scale) + 35);
        //правая пунктирная
        ctx.moveTo(this.getX() + this.getLength() / scale - karkasDepth1 + karkasDepth1 / 2, this.getY() - 35);
        ctx.lineTo(this.getX() + this.getLength() / scale - karkasDepth1 + karkasDepth1 / 2, this.getY() + (this.getWidth() / scale) + 35);
        // ctx.lineWidth = 0.9;
        ctx.setLineDash([45, 25]);
        ctx.strokeStyle = "rgba(255,120,0,0.8)";
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        return this;
    };

    getX3D() {
        return this.getX()
    }

    getY3D() {
        return this.getY()
    }

    static from(json) {
        return Object.assign(new Karkas(), json);
    }
}

class ChangeSizeElement extends RelatedShape {

    isFirst;
    name = 'ChangeSizeElement';

    constructor(shape) {
        super(shape);
    }

    getX() {
        let parent = this.getParent();
        if (parent) {
            return this.isFirst ?
                parent.getLength() > parent.width ?
                    parent.getX() - parent.width / 2 / scale - 3 : parent.getX() - 3
                :
                parent.getLength() > parent.width ?
                    parent.getX() + parent.getLength() / scale - parent.width / 2 / scale - 3 : parent.getX() + parent.getLength() / 2 / scale - 5
        }
    }


    getY() {
        let parent = this.getParent();
        if (parent) {
            return this.isFirst ?
                parent.getLength() > parent.width ?
                    parent.getY() - 3 : parent.getY() - 3 - parent.getLength() / 2 / scale
                :
                parent.getLength() > parent.width ?
                    parent.getY() - 3 : parent.getY() + parent.width / scale - 6
        }
    }

    getLength() {
        return this.getWidth();
    }

    getWidth() {
        let parent = this.getParent();
        if (parent) {
            return parent.getLength() > parent.width ?
                (parent.width / scale) + 6 : (parent.getLength() / scale) + 6
        }

    }

    draw = function (ctx) {

        let parent = this.getParent();
        if (parent) {
            ctx.beginPath();
            ctx.strokeStyle = colorBlack;
            ctx.fillStyle = colorBlack;


            if (this.isFirst) {
                if (parent.getLength() > parent.width) {
                    ctx.arc(parent.getX(), parent.getY() + parent.width / 2 / scale, parent.width / 2 / scale + 1, 0, Math.PI * 2, false);
                } else {
                    ctx.arc(parent.getX() + parent.getLength() / 2 / scale, parent.getY(), parent.getLength() / 2 / scale + 1, 0, Math.PI * 2, false);
                }
            } else {
                if (parent.getLength() > parent.width) {
                    ctx.arc(parent.getX() + parent.getLength() / scale, parent.getY() + parent.width / 2 / scale, parent.width / 2 / scale + 1, 0, Math.PI * 2, false);
                } else {
                    ctx.arc(parent.getX() + parent.getLength() / 2 / scale, parent.getY() + parent.width / scale, parent.getLength() / 2 / scale + 1, 0, Math.PI * 2, false);

                }
            }
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    };

    resizeShape(dx, dy) {
        let parent = this.getParent();
        if (parent) {
            parent.resize && parent.resize(dx, dy, this.isFirst);
        }
    }

    onClick = () => {

    }

}

class Arrow extends Shape {

    type;
    name = 'Arrow';

    constructor(releted, type, color, text) {
        if (releted) {
            super(releted.getX(), releted.getY() + (type === POSITION.TOP ? (-50) : (+50)),
                (type === POSITION.TOP || type === POSITION.BOTTOM) ? releted.getLength() : releted.width,
                undefined, colorGrey, text, true);
            this.parentId = releted.getId();
            this.type = type;
            releted.arrowsId.push(this.getId());
        } else {
            super()
        }
    }

    draw = function (ctx) {

        let parent = this.getParent();
        let arrowType = this.type;
        if (parent) {
            let arrowLength = 100 / scale > 20 ? 20 : 100 / scale;
            let arrowWidth = 50 / scale > 10 ? 10 : 50 / scale;
            let arrowFont = 90 / scale > 18 ? 18 : 90 / scale;
            let arrowShift = getArrowShift(parent, arrowType);

            let arrow60 = getScaleValue(arrowShift[0]);
            let arrow50 = getScaleValue(arrowShift[1]);
            let arrow45 = getScaleValue(arrowShift[2]);
            let arrow55 = getScaleValue(arrowShift[3]);


            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.moveTo(parent.getX(), parent.getY());
            if (this.type === POSITION.TOP || this.type === POSITION.BOTTOM) {
                ctx.lineTo(parent.getX(), parent.getY() + (this.type === POSITION.TOP ? (-arrow60) : (arrow60)));
                ctx.moveTo(parent.getX() + parent.getLength() / scale, parent.getY());
                ctx.lineTo(parent.getX() + parent.getLength() / scale, parent.getY() + (this.type === POSITION.TOP ? (-arrow60) : (arrow60)));
            } else {
                ctx.lineTo(parent.getX() + (this.type === POSITION.LEFT ? (-arrow60) : arrow60), parent.getY());
                ctx.moveTo(parent.getX(), parent.getY() + parent.getWidth() / scale);
                ctx.lineTo(parent.getX() + (this.type === POSITION.LEFT ? (-arrow60) : arrow60), parent.getY() + parent.getWidth() / scale);
            }
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = this.color;
            if (this.type === POSITION.TOP || this.type === POSITION.BOTTOM) {
                ctx.moveTo(parent.getX(), parent.getY() + (this.type === POSITION.TOP ? (-arrow50) : (arrow50)));
                ctx.lineTo(parent.getX() + parent.getLength() / scale, parent.getY() + (this.type === POSITION.TOP ? (-arrow50) : (arrow50)));
            } else {
                ctx.moveTo(parent.getX() + (this.type === POSITION.LEFT ? (-arrow50) : arrow50), parent.getY());
                ctx.lineTo(parent.getX() + (this.type === POSITION.LEFT ? (-arrow50) : arrow50), parent.getY() + parent.getWidth() / scale);
            }
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = this.color;
            if (this.type === POSITION.TOP || this.type === POSITION.BOTTOM) {
                drawLeftArrow(ctx, parent.getX(), parent.getY() + (this.type === POSITION.TOP ? (-arrow50) : (+arrow50)), arrowLength, arrowWidth)
            } else {
                drawTopArrow(ctx, parent.getX() + (this.type === POSITION.LEFT ? (-arrow50) : arrow50), parent.getY(), arrowWidth, arrowLength)
            }
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = this.color;
            if (this.type === POSITION.TOP || this.type === POSITION.BOTTOM) {
                drawRightArrow(ctx,
                    parent.getX() + parent.getLength() / scale,
                    parent.getY() + (this.type === POSITION.TOP ? (-arrow50) : arrow50), arrowLength, arrowWidth)
            } else {
                drawBottomArrow(ctx,
                    parent.getX() + (this.type === POSITION.LEFT ? (-arrow50) : arrow50),
                    parent.getY() + parent.getWidth() / scale, arrowWidth, arrowLength)
            }
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.save();
            ctx.fillStyle = "#000000";
            // ctx.font = item.size + "pt";
            ctx.font = "italic " + arrowFont + "pt Arial";
            let text = !!this.text ? this.text : (((this.type === POSITION.TOP || this.type === POSITION.BOTTOM) ? Math.round(parent.getLength()) : Math.round(parent.getWidth())) + " мм");
            let textX = (this.type === POSITION.TOP || this.type === POSITION.BOTTOM) ?
                (parent.getX() + (parent.getLength() / 2) / scale - text.length * 30 / scale) :
                this.type === POSITION.LEFT ? parent.getX() - arrow55 : parent.getX() + arrow45;
            let textY = this._getTextPositionY(this.type, arrow55, arrow45);
            if (this.type === POSITION.RIGHT) {
                ctx.translate(textX, textY);
                ctx.rotate(270 * Math.PI / 180);
                ctx.fillText(text, -parent.getWidth() / 2 / scale - text.length * 30 / scale, 0);
            } else if (this.type === POSITION.LEFT) {
                ctx.translate(textX, textY);
                ctx.rotate(270 * Math.PI / 180);
                ctx.fillText(text, -parent.getWidth() / 2 / scale - text.length * 30 / scale, 0);
            } else {
                ctx.fillText(text, textX, textY);
            }

            ctx.restore();
            ctx.closePath();
        }
    };

    _getTextPositionY(type, position55, position45) {
        let parent = this.getParent();
        if (parent) {
            switch (type) {
                case POSITION.TOP:
                    return parent.getY() - position55;
                case POSITION.BOTTOM:
                    return parent.getY() + position45;
                default:
                    return parent.getY() + 0;
            }
        }
    };
}

getArrowShift = (parent, type) => {
    if (parent && parent.name === 'Karkas') {
        return shapes.filter(item => (item.name === 'Window' ||
            item.name === 'Door') && item.position === type).length > 0 ?
            [90, 80, 75, 85] : [60, 50, 45, 55]
    } else {
        return [60, 50, 45, 55]
    }
};

//-------------------------------------------end -------------------------/
turnShape = (shape) => {

    let y = shape.getY();
    let x = shape.getX();
    let w = shape.getLength();
    let h = shape.getWidth();

    let width = shape.getLength();
    shape.setLength(shape.getWidth());
    shape.setWidth(width);

    if (w > h) {
        shape.setX(x + (w / 2 / scale) - (h / 2 / scale));
        shape.setY(y - (w / 2 / scale));

    } else {
        shape.setX(x - (h / 2 / scale) - (w / 2 / scale));
        shape.setY(y + (h / 2 / scale));
    }

    let arrow = getShapeById(shape.arrowsId[0]);
    if (arrow) {
        if (arrow.type === POSITION.TOP) {
            arrow.type = POSITION.RIGHT
        } else if (arrow.type === POSITION.BOTTOM) {
            arrow.type = POSITION.LEFT
        } else if (arrow.type === POSITION.LEFT) {
            arrow.type = POSITION.TOP
        } else {
            arrow.type = POSITION.BOTTOM
        }
    }
};

function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}

//клик правой клавишей
function rightClick() {
    console.info("клик правой кнопкой")
};

//клик роликом
function rolClick() {
    canvas.style.cursor = "move";
    console.info("клик роликом");
    allDraging = true;
};

// given mouse X & Y (mx & my) and shape object
// return true/false whether mouse is inside the shape
function isMouseInShape(mx, my, shape) {
    var rLeft = shape.getX() - 10;
    var rRight = shape.getX() + shape.getLength() / scale + 20;
    var rTop = shape.getY() - 10;
    var rBott = shape.getY() + shape.getWidth() / scale + 20;
    // math test to see if mouse is inside rectangle
    if (shape.name === 'Light') {
        console.info(my, shape.getY(), rBott, shape.getWidth());

    }
    if (mx > rLeft && mx < rRight && my > rTop && my < rBott) {
        return (true);
    }

    // the mouse isn't in any of the shapes
    return (false);
}

function isMouseInShapeAccurency100(mx, my, shape) {
    var rLeft = shape.getX();
    var rRight = shape.getX() + shape.getLength() / (isSerialized(shape) ? scale : 1);
    var rTop = shape.getY();
    var rBott = shape.getY() + shape.getWidth() / (isSerialized(shape) ? scale : 1);

    if (mx > rLeft && mx < rRight && my > rTop && my < rBott) {
        return true;
    }

    return false;
}

function needHideControlButton(mx, my, shape) {
    if (shape.getLength()) {
        var rLeft = shape.getX() - 50;
        var rRight = shape.getX() + shape.getLength() / scale + 50;
        var rTop = shape.getY() - 50;
        var rBott = shape.getY() + shape.getWidth() / scale + 50;
        // math test to see if mouse is inside rectangle
        if (mx > rLeft && mx < rRight && my > rTop && my < rBott) {
            return (false);
        }
    }
    // the mouse isn't in any of the shapes
    return (true);
}

function handleMouseDown(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    if (e.which === 3) {
        rightClick(e);
        return;
    } else if (e.which === 2) {
        rolClick(e);
        return;
    }

    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i] instanceof ChangeSizeElement && !shapes[i].notDragable && isMouseInShape(startX, startY, shapes[i])) {
            shapes[i].onClick && shapes[i].onClick();
            if (shapes[i]) {
                selectedShapeId = shapes[i].getId();
                isDragging = true;
                return;
            }
        }
    }
    for (var i = 0; i < shapes.length; i++) {
        if (!shapes[i].notDragable && isMouseInShapeAccurency100(startX, startY, shapes[i])) {
            shapes[i].onClick && shapes[i].onClick();
            if (shapes[i]) {
                selectedShapeId = shapes[i].getId();
                isDragging = true;
                shapes.filter(item => !item.relatedShapes || item.relatedShapes.indexOf(selectedShapeId) === -1).forEach(confirmShapes);
                shapes[i].fixed = false;
            }
            return;
        }
    }
}

function handleMouseUp(e) {
    allDraging = false;
    canvas.style.cursor = "default";
    // return if we're not dragging
    if (!isDragging) {
        return;
    }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;

    drawAll();
    serialize();
}

function handleMouseOut(e) {
    // return if we're not dragging
    if (!isDragging) {
        return;
    }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;
}

function handleMouseMove(e) {
    //текущие координаты мыши
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    let has = false;// мышка находится на элементе с подсказкой
    for (var i = 0; i < shapes.length; i++) {
        if (!isDragging && isMouseInShape(mouseX, mouseY, shapes[i])) {
            //если курсор находится над фигурой, необходимо отрисовать кнопки
            /* if (shapes.filter(i => !i.fixed).length === 0) */
            shapes[i].fixed = false;
        } else {
            //если курсор отвели от фигуры спрятать кнопки управления
            !isDragging && needHideControlButton(mouseX, mouseY, shapes[i]) && shapes[i].confirm && shapes[i].confirm();
        }
        //проверка и отрисовка подсказок
        if (isMouseInShapeAccurency100(mouseX, mouseY, shapes[i]) && shapes[i].hint) {
            has = true;
            drawAll();
            canvas.style.cursor = "pointer";
            shapes[i] && drawHint(ctx, mouseX, mouseY, shapes[i].hint)
        }
    }
    if (!has) {
        //скрываем подсказки
        canvas.style.cursor = "default";
        drawAll();
    }

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position

    // how far has the mouse dragged from its previous mousemove position?
    var dx = mouseX - startX;
    var dy = mouseY - startY;

    if (allDraging) {
        karkas.setX(karkas.getX() + dx);
        karkas.setY(karkas.getY() + dy);
        drawAll();
        startX = mouseX;
        startY = mouseY;
        return;
    }

    if (!isDragging) {
        return;
    }

    // move the selected shape by the drag distance
    var selectedShape = getSelectedShape();
    // let magnetShapeXValue = magnetShapeX(selectedShape);

    if (selectedShape instanceof ChangeSizeElement) {
        selectedShape.resizeShape((/*magnetShapeXValue ? magnetShapeXValue :*/ dx), dy)
    } else {
        selectedShape.setX(selectedShape.getX() + (/*magnetShapeXValue ? magnetShapeXValue :*/ dx));
        selectedShape.setY(selectedShape.getY() + dy);
    }
    // clear the canvas and redraw all shapes
    drawAll();

    // update the starting drag position (== the current mouse position)
    // if (!magnetShapeXValue) {
    startX = mouseX;
    // }
    startY = mouseY;
}

function magnetShapeX(shape) {
    let accuracyWithScale = getScaleValue(accuracy);
    let result = 0;
    shapes.filter(item => item.getId() !== shape.getId())
        .filter(item => !(item instanceof RelatedShape))
        .filter(item => !(item instanceof Arrow))
        .filter(item => shape.getId() !== item.parentId)
        .filter(item => item.getId() !== karkas.getId())
        .forEach(item => {
            if (shape instanceof RelatedShape) {
                shape = shape.getParent()
            }
            var sLeft = shape.getX();
            var sRight = shape.getX() + shape.getLength() / scale;
            var sTop = shape.getY();
            var sBott = shape.getY() + shape.getWidth() / scale;

            var iLeft = item.getX();
            var iRight = item.getX() + item.getLength() / scale;
            var iTop = item.getY();
            var iBott = item.getY() + item.getWidth() / scale;
            // math test to see if mouse is inside rectangle
            if (sRight + accuracyWithScale > iLeft && sRight < iLeft + accuracyWithScale) {
                result = iLeft - sRight;
            } else if (sRight + accuracyWithScale > iRight && sRight < iRight + accuracyWithScale) {
                result = iRight - sRight;
            }
        });

    return Number(round(result, 5));
}

//функция обработки ролика мышки
var mouse_wheel = function (event) {
    //запрещаем прокручивать страницу при изменении масштаба
    event.preventDefault();

    if (false == !!event) event = window.event;
    var direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || false;
    if (direction && !!wheel_handle && typeof wheel_handle == "function") {
        wheel_handle(direction);
    }
};

var set_handle = function (canvas, func) {
    canvas.onmouseover = function () {
        wheel_handle = func;
    };
    canvas.onmouseout = function () {
        wheel_handle = null;
    }
};

function handleMouseWheelUp(v) {

    scale += v > 0 ? .3 : -0.3;
    if (scale < 2) scale = 2;
    confirmAllShapes();
    drawAll()
}

function confirmAllShapes() {
    shapes.forEach(confirmShapes);
}

function confirmShapes(shape) {
    shape.confirm && shape.confirm()
}

function getScaleValue(value) {
    let calcValue = value * defScaleValue / scale;
    return (calcValue > value) ? value : calcValue;
}

// clear the canvas and
// redraw all shapes in their current positions

function drawAll() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colorWhite;
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    if (allDraging || (isDragging && getSelectedShape() instanceof ChangeSizeElement)) {
        canvas.style.cursor = "move";
    } else {
        canvas.style.cursor = "default";
    }

    let length = shapes.length;
    shapes = shapes.filter(item => !item.deleted);
    !view3D && shapes.forEach(shapeDraw);

    if (!view3D && shapes.length !== length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shapeDraw);
    }

    if (view3D) {
        drawDimetry();
    }
    selectTexture();
    kalkulatePrice();

}

function setDeleteAllShapeInArrId(arr) {
    arr && arr.forEach(setDeleteByShapeId);
}

function setDeleteByShapeId(id) {
    getShapeById(id).deleted = true;
}

function shapeDraw(shape) {
    shape && shape.draw && shape.draw(ctx)
}

function drawKarkasBottom({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h}) {
    let x = x1 * cos7 + sin41 * y1;
    let y = y1 * cos41 - sin7 * x1 - h1;
    ctx.save();
    ctx.beginPath();
    ctx.setTransform(1, -0.126, 1.145, 1, -y * 114.5 / 100, x * 12.6 / 100);
    ctx.drawImage(pol, 0, 0, imageCoeffWidth * w, imageTextureHeight, x, y, (w / scale) - 4 * defScaleValue / scale, h * 0.49 / scale);
    ctx.closePath();
    ctx.restore();
}

function drawKarkasRight1({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h}) {
    draw3dRigth({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color: 'rgb(205,128,0)', w, h}, 'rgb(205,128,0)');
}

function drawKarkasRight2({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h}) {
    let karkasDepth1 = karkasDepth * defScaleValue / scale;
    let x11 = x2 - karkasDepth1;
    let y11 = y2 + karkasDepth1 * y3dcefficient;
    ctx.save();
    ctx.beginPath();
    let x = x11 * cos7 + sin41 * y11;
    let y = y11 * cos41 - sin7 * x11 - h2;
    ctx.setTransform(1, 0.875, 0, 1, 0, -x * 87.5 / 100);
    ctx.drawImage(vagonka, 0, 0, imageCoeffWidth * h * 0.58, imageTextureHeight, x, y, h * 0.55 / scale, karkasHeight / scale);
    ctx.closePath();
    ctx.restore();
    draw3dRigth({
        name,
        x1,
        x2: x2 - karkasDepth1,
        x3: x3 - karkasDepth1,
        x4,
        y1,
        y2: y2 + karkasDepth1 * y3dcefficient,
        y3: y3 - karkasDepth1,
        y4,
        h1,
        h2,
        color,
        w,
        h
    })
}

function drawKarkasInner1({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h}) {
    draw3dBack({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color: 'rgb(205,128,0)', w, h}, 'rgb(205,128,0)')
}

function drawKarkasInner2({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h}) {
    let karkasDepth1 = karkasDepth * defScaleValue / scale
    let x11 = x1 + karkasDepth1;
    let y11 = y1 + karkasDepth1 * y3dcefficient;

    ctx.save();
    ctx.beginPath();
    let x = x11 * cos7 + sin41 * y11;
    let y = y11 * cos41 - sin7 * x11 - h2;
    ctx.setTransform(1, -0.1217, 0, 1, 0, x * 12.17 / 100);
    ctx.drawImage(vagonka, 0, 0, imageCoeffWidth * w, imageTextureHeight, x, y, ((w / scale) - 2.3 * karkasDepth1), karkasHeight / scale);
    ctx.closePath();
    ctx.restore();
    draw3dBack({name, x1: x11, x2: x2 - (karkasDepth1), x3, x4, y1: y11, y2: y11, y3, y4, h1, h2, color, w, h})
}

function drawKarkasLeft({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, colorBottomLine, bottomLineHeight, w, h}) {
    let karkasDepth1 = karkasDepth * defScaleValue / scale
    draw3dLeft({
        name,
        x1: x1 + karkasDepth1,
        x2,
        x3,
        x4: x4 + karkasDepth1,
        y1: y1 + karkasDepth1 * 0.7,
        y2,
        y3,
        y4: y4 - karkasDepth1,
        h1,
        h2,
        color: 'rgb(205,128,0)',
        w,
        h
    }, undefined, 'rgb(205,128,0)');
    ctx.save();
    ctx.beginPath();
    let x = x1 * cos7 + sin41 * y1;
    let y = y1 * cos41 - sin7 * x1 - h2;
    ctx.setTransform(1, 0.875, 0, 1, 0, -x * 87.5 / 100);

    ctx.drawImage(fon, 0, 0, imageCoeffWidth * h, imageTextureHeight, x, y, h * 0.565 / scale, karkasHeight / scale);
    ctx.closePath();
    ctx.restore();
    draw3dLeft({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h});
    colorBottomLine && bottomLineHeight && !isNaN(bottomLineHeight) && draw3dLeft({
        name,
        x1,
        x2,
        x3,
        x4,
        y1,
        y2,
        y3,
        y4,
        h1,
        h2: h1 - bottomLineHeight / scale,
        color: colorBottomLine,
        w,
        h
    }, colorBottomLine, colorBottomLine)
}

function drawKarkasFront({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, colorBottomLine, bottomLineHeight, w, h}) {
    let karkasDepth1 = karkasDepth * defScaleValue / scale
    draw3dFront({
        name,
        x1,
        x2,
        x3: x3 - karkasDepth1 * 0.5,
        x4: x4 + karkasDepth1,
        y1,
        y2,
        y3: y3 - karkasDepth1,
        y4: y4 - karkasDepth1,
        h1,
        h2,
        color: 'rgb(205,128,0)',
        w,
        h
    }, 'rgba(0,0,0,0)');
    let x = x4 * cos7 + sin41 * y4;
    let y = y4 * cos41 - sin7 * x4 - h2;

    ctx.save();
    ctx.beginPath();
    ctx.setTransform(1, -0.1217, 0, 1, 0, x * 12.17 / 100);
    ctx.drawImage(fon, 0, 0, imageCoeffWidth * w, imageTextureHeight, x, y, w / scale - 4 * defScaleValue / scale, karkasHeight / scale);
    ctx.closePath();
    ctx.restore();

    draw3dFront({name, x1, x2, x3, x4, y1, y2, y3, y4, h1, h2, color, w, h})
    colorBottomLine && bottomLineHeight && !isNaN(bottomLineHeight) && draw3dFront({
        name,
        x1,
        x2,
        x3,
        x4,
        y1,
        y2,
        y3,
        y4,
        h1,
        h2: h1 - bottomLineHeight / scale,
        color: colorBottomLine,
        w,
        h
    }, colorBottomLine, colorBottomLine)
}

function drawFrontImage({name, x1, x2, x3, x4, y1, y2, y3, y4, hh, h1, h2, h, w, color, image, gorizontal}) {
    let img = imageMap.get(image);
    let x = x4 * cos7 + sin41 * y4;
    let y = y4 * cos41 - sin7 * x4 - h2;

    ctx.save();
    ctx.beginPath();
    ctx.setTransform(1, -0.1217, 0, 1, 0, x * 12.17 / 100);
    img && ctx.drawImage(img, x, y, w / scale, hh / scale);

    ctx.closePath();
    ctx.restore();
}

function drawLeftImage({name, x1, x2, x3, x4, y1, y2, y3, y4, hh, h1, h2, h, w, color, image, gorizontal}) {

    let img = imageMap.get(image);

    ctx.save();
    ctx.beginPath();

    let x = x1 * cos7 + sin41 * y1;
    let y = y1 * cos41 - sin7 * x1 - h2;
    ctx.setTransform(1, 0.875, 0, 1, 0, -x * 87.5 / 100);
    img && ctx.drawImage(img, x, y, h * y3dcefficient * 0.77 / scale, hh / scale);

    ctx.closePath();
    ctx.restore();
}

function draw3dPartition({name, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal, shape}) {
    if (gorizontal) {
        let x = x4 * cos7 + sin41 * y4;
        let y = y4 * cos41 - sin7 * x4 - h2;
        ctx.save();
        ctx.beginPath();
        ctx.setTransform(1, -0.1217, 0, 1, 0, x * 12.17 / 100);
        ctx.drawImage(vagonka, 0, 0, imageCoeffWidth * w, imageTextureHeight, x, y, w / scale - 4 * defScaleValue / scale, karkasHeight / scale);
        ctx.closePath();
        ctx.restore();
    } else {
        ctx.save();
        ctx.beginPath();
        let x = x1 * cos7 + sin41 * y1;
        let y = y1 * cos41 - sin7 * x1 - h2;
        ctx.setTransform(1, 0.875, 0, 1, 0, -x * 87.5 / 100);
        ctx.drawImage(vagonka, 0, 0, imageCoeffWidth * h, imageTextureHeight, x, y, h * 0.565 / scale, karkasHeight / scale);
        ctx.closePath();
        ctx.restore();
    }
    draw3dLeft({name, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color: gorizontal && color, gorizontal});
    draw3dFront({name, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color: !gorizontal && color, gorizontal});
    draw3dRoof({name, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal});

    shape.getDoorsIfExist().forEach(door => {
        let data3D = parseDataTo3DCreate(door);
        if (gorizontal) {
            !!data3D.image ? drawFrontImage(data3D) : draw3dFront(data3D);
        } else {
            !!data3D.image ? drawLeftImage(data3D) : draw3dLeft(data3D);
        }
    });


    shapes.filter(isSerialized).filter(filterFrontDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawFrontImage(item) : draw3dRectangle(item));
    shapes.filter(isSerialized).filter(filterLeftDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawLeftImage(item) : draw3dRectangle(item));
}

function draw3dRigth({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle || 'rgb(0,0,0)';
    ctx.fillStyle = color;
    ctx.moveTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h1);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h2);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h2);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h1);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h1);
    ctx.stroke();
    color && ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw3dBack({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle || 'rgb(0,0,0)';
    ctx.fillStyle = color;
    ctx.moveTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h1);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h2);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h2);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.stroke();
    color && ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw3dFloor({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.fillStyle = color;
    ctx.moveTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h1);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h1);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h1);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.stroke();
    color && ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw3dRoof({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.fillStyle = color;
    ctx.moveTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h2);
    ctx.lineTo(x2 * cos7 + sin41 * y2, y2 * cos41 - sin7 * x2 - h2);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h2);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h2);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h2);
    ctx.stroke();
    color && ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw3dFront({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle || 'rgb(0,0,0)';
    ctx.fillStyle = color;
    ctx.moveTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h1);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h2);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h2);
    ctx.lineTo(x3 * cos7 + sin41 * y3, y3 * cos41 - sin7 * x3 - h1);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h1);
    ctx.stroke();
    color && ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw3dLeft({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}, fill, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle || 'rgb(0,0,0)';
    ctx.fillStyle = color;
    if (fill) {
        ctx.fillStyle = fill;
    }
    ctx.moveTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h2);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h2);
    ctx.lineTo(x4 * cos7 + sin41 * y4, y4 * cos41 - sin7 * x4 - h1);
    ctx.lineTo(x1 * cos7 + sin41 * y1, y1 * cos41 - sin7 * x1 - h1);
    ctx.stroke();

    color && ctx.fill();

    ctx.closePath();
    ctx.restore();
}

function draw3dRectangle({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal}) {
    //правая плоскость
    if (name !== 'InnerDoor') {
        draw3dRigth({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal})
    }
    // нижняя плоскость
    draw3dFloor({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal})
    //передняя плоскость
    if (name !== 'InnerDoor' || gorizontal) {
        draw3dFront({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal},
            name === 'InnerDoor' ? color : undefined)
    }
    //левая плоскость
    if (name !== 'InnerDoor' || !gorizontal) {
        draw3dLeft({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal})
    }
    if (name !== 'InnerDoor') {
        draw3dRoof({name, x, y, x1, x2, x3, x4, y1, y2, y3, y4, w, h, h1, h2, color, gorizontal})
    }
}

function drawDimetry() {

    let karkasData = shapes.filter(isSerialized).filter(item => item.name === 'Karkas').map(parseDataTo3DCreate);

    karkasData.forEach(item => {
        drawKarkasInner1(item);
        drawKarkasRight1(item);
        draw3dRoof(item);
        drawKarkasBottom(item);
        drawKarkasInner2(item);
        drawKarkasRight2(item);
    });

    shapes.filter(isSerialized).filter(filterTopDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawFrontImage(item) : draw3dRectangle(item));
    shapes.filter(isSerialized).filter(filterRightDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawLeftImage(item) : draw3dRectangle(item));
    shapes.filter(filterTopWindow).map(parseDataTo3DCreate).forEach(drawFrontImage);
    shapes.filter(filterRightWindow).map(parseDataTo3DCreate).forEach(drawLeftImage);
    shapes.filter(isSerialized).filter(filterPartition).map(parseDataTo3DCreate)
        .sort(sortInner).forEach(draw3dPartition);
    let karkasDepth1 = karkasDepth * defScaleValue / scale;
    karkasData.forEach(item => {
        drawKarkasLeft(item);
        drawKarkasFront(item);
        draw3dRoof({
            x1: item.x1 + karkasDepth1,
            x2: item.x2 - karkasDepth1,
            x3: item.x3 - karkasDepth1,
            x4: item.x4 + karkasDepth1,
            y1: item.y1 + karkasDepth1 * 0.8,
            y2: item.y2 + karkasDepth1 * 0.8,
            y3: item.y3 - karkasDepth1 * 0.9,
            y4: item.y4 - karkasDepth1 * 0.9,
            h2: item.h2
        })
    });
    shapes.filter(isSerialized).filter(filterFrontDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawFrontImage(item) : draw3dRectangle(item));
    shapes.filter(isSerialized).filter(filterLeftDoor).map(parseDataTo3DCreate).forEach(item => item.image ? drawLeftImage(item) : draw3dRectangle(item));
    shapes.filter(filterFrontWindow).map(parseDataTo3DCreate).forEach(drawFrontImage);
    shapes.filter(filterLeftWindow).map(parseDataTo3DCreate).forEach(drawLeftImage);
}

function sortInner(a, b) {
    if (a.x > b.x && (a.x + a.w) > (b.x + b.w) && a.y < b.y && (a.y + a.h) < (b.y + b.h)) {
        return false;
    }
    if (a.x < b.x && (a.x + a.w) < (b.x + b.w) && a.y > b.y && (a.y + a.h) > (b.y + b.h)) {
        return true;
    }
    if (a.x < b.x && (a.x + a.w) < (b.x) && a.y < b.y && (a.y + a.h) < (b.y + b.h)) {
        return true;
    }
    if (a.x > (b.x + b.w) && a.y > (b.y + b.h)) {
        return true;
    }
    if (a.x === b.x && (a.x + a.w) === (b.x + b.w)) {
        return a.y > b.y;
    }
    if (a.y === b.y && (a.y + a.h) === (b.y + b.h)) {
        return a.x < b.x;
    }
    if (a.x > b.x && a.x + b.w < b.x + b.w) {
        return a.y + a.h > b.y;
    }
    if ((a.y + a.h) < (b.y + b.h) && a.y > b.y) {
        return b.x > a.x
    }
    if (a.y < b.y && (a.y + a.h) > (b.y + b.h)) {
        return b.x > a.x
    }
    if (a.h === 50 && b.h === 50) {
        return a.y > b.y
    }
    if (a.w === 50 && b.w === 50) {
        return a.x < b.x
    }
    if ((a.x > b.x || a.x === b.x) && (a.x + a.w) < (b.x + b.w)) {
        return a.y > b.y
    }
    if ((a.x < b.x || a.x === b.x) && (a.x + a.w) > (b.x + b.w)) {
        return a.y > b.y
    }
    if ((a.x < b.x) && ((a.x + a.w) < (b.x) || (a.x + a.w) === (b.x))) {
        return false
    }
    console.info('не обработанный приоритет ', a, b);
    return a.y > b.y
}

function filterFrontDoor(item) {
    return item.name === 'Door' && (item.position === POSITION.BOTTOM)
}

function filterLeftDoor(item) {
    return item.name === 'Door' && (item.position === POSITION.LEFT)
}

function filterBottomDoor(item) {
    return item.name === 'Door' && (item.position === POSITION.BOTTOM)
}

function filterBottomWindow(item) {
    return item.name === 'Window' && (item.position === POSITION.BOTTOM)
}

function filterRightDoor(item) {
    return item.name === 'Door' && (item.position === POSITION.RIGHT)
}

function filterTopDoor(item) {
    return item.name === 'Door' && (item.position === POSITION.TOP)
}

function filterPartition(item) {
    return item.name === 'Partition'
}


function filterFrontWindow(item) {
    return item.name === 'Window' && (item.position === POSITION.BOTTOM)
}

function filterLeftWindow(item) {
    return item.name === 'Window' && (item.position === POSITION.LEFT)
}

function filterRightWindow(item) {
    return filterByNameAndPosition(item, 'Window', POSITION.RIGHT);
}

function filterTopWindow(item) {
    return filterByNameAndPosition(item, 'Window', POSITION.TOP);
}

function filterByNameAndPosition(item, name, position) {
    return item.name === name && (item.position === position)
}

function parseDataTo3DCreate(shape) {
    let heightPosition = getHeightPosition(shape);
    return {
        name: shape.name,
        x: shape.getX(),
        y: shape.getY() + 2500 / scale,
        x1: shape.getX3D(),
        y1: shape.getY3D(),
        x2: shape.getX3D() + shape.getLength() / scale,
        y2: shape.getY3D(),
        x3: shape.getX3D() + shape.getLength() / scale,
        y3: shape.getY3D() + shape.getWidth() * y3dcefficient / scale,
        x4: shape.getX3D(),
        y4: shape.getY3D() + shape.getWidth() * y3dcefficient / scale,
        w: shape.getLength(),
        h: shape.getWidth(),
        hh: shape.height,
        h1: (heightPosition - shape.height) / scale,
        h2: heightPosition / scale,
        color: (shape.name == "Window") ?
            'rgba(0,12,255,0)' :
            (shape.name == 'Door' || shape.name == 'InnerDoor') ?
                'rgb(178,88,0)' :
                (shape.name == 'Partition') ?
                    'rgb(205,128,0)' : 'rgba(0, 0, 0, 0)',
        colorBottomLine: shape.colorButtomLine,
        bottomLineHeight: shape.bottomLineHeight,
        gorizontal: (shape.getLength() > shape.getWidth()),
        image: shape.image3D,
        shape: shape

    }
}

getHeightPosition = shape => {
    if (shape.name === 'Window') {
        return (getWindowsSettingValue(shape.settingId, 'heightPosition') || 2100)
    } else if (shape.name === 'Door' || shape.name === 'InnerDoor') {
        return (getDoorSettingValue(shape.settingId, 'heightPosition') || 2000)
    } else {
        return 2500;
    }
};

getDoorSettingValue = (id, field) => {
    return getSettingValue(doorsEl, field, id)
};

getWindowsSettingValue = (id, field) => {
    return getSettingValue(windowsEl, field, id)
};

getSettingValue = (data, field, id) => {
    let filter = (data && field && id) ? data.filter(i => i.id === id) : [];
    if (filter.length > 0) {
        return filter[0][field];
    }
    return null;
};

function selectTexture() {
    let root = document.getElementById(rootDivId);
    removeElement('select-texture-block');
    let selectDiv = createHtmlElement(HTML_ELEMENT.DIV, {id: 'select-texture-block'});

    if (!!textureOuter && textureOuter.length > 1) {
        let htmlElement = createHtmlElement(HTML_ELEMENT.DIV, {style: 'padding: 10px 0 0'});
        selectDiv.appendChild(htmlElement);
        htmlElement.appendChild(createHtmlElement(HTML_ELEMENT.SPAN, {
            text: 'Наружная отделка',
            style: 'width: 200px;display: inline-block;'
        }));
        htmlElement.appendChild(createSelect(textureOuter, 'TEXTURE_OUTER', fon));
    }
    if (!!textureInner && textureInner.length > 1) {
        let htmlElement = createHtmlElement(HTML_ELEMENT.DIV, {style: 'padding: 10px 0 0'});
        selectDiv.appendChild(htmlElement);
        htmlElement.appendChild(createHtmlElement(HTML_ELEMENT.SPAN, {
            text: 'Внутренняя отделка',
            style: 'width: 200px;display: inline-block;'
        }));
        htmlElement.appendChild(createSelect(textureInner, 'TEXTURE_INNER', vagonka));
    }
    if (!!textureFloor && textureFloor.length > 1) {
        let htmlElement = createHtmlElement(HTML_ELEMENT.DIV, {style: 'padding: 10px 0 0'});
        selectDiv.appendChild(htmlElement);
        htmlElement.appendChild(createHtmlElement(HTML_ELEMENT.SPAN, {
            text: 'Напольное покрытие',
            style: 'width: 200px;display: inline-block;'
        }));
        htmlElement.appendChild(createSelect(textureFloor, 'TEXTURE_FLOOR', pol));
    }
    if (karkas) {
        let baseConfigById = getBaseConfigById(karkas.settingId);
        let walls = baseConfigById && baseConfigById.walls || karkas.walls;
        if (!!walls && walls.length > 1) {
            let htmlElement = createHtmlElement(HTML_ELEMENT.DIV, {style: 'padding: 10px 0 0'});
            selectDiv.appendChild(htmlElement);
            htmlElement.appendChild(createHtmlElement(HTML_ELEMENT.SPAN, {
                text: 'Настройка наружных стен',
                style: 'width: 200px;display: inline-block;'
            }));
            htmlElement.appendChild(createSelectWall(walls, 'wall'));
        }
    }

    root.appendChild(selectDiv);
}

function createSelectWall(dataToSelect, id) {
    let htmlSelectElement = document.createElement('select');
    htmlSelectElement.setAttribute("id", id);
    htmlSelectElement.setAttribute("style", "width: 600px");
    !!dataToSelect && dataToSelect.length > 1 && dataToSelect.forEach(i => {
        let htmlOptionElement = document.createElement('option');
        let value = i.id;
        htmlOptionElement.setAttribute("value", value);
        if ((value + '') === (karkas[id].id + '')) {
            htmlOptionElement.setAttribute("selected", 'selected');
        }
        htmlOptionElement.innerText = i.description + (showPrice ? (i.def ? ' (входит в стоимость базовой комплектации)' : (" (" + i.price + " руб)")) : "");
        htmlSelectElement.appendChild(htmlOptionElement);
    });
    htmlSelectElement.addEventListener("change", function () {
        let value = document.getElementById(id).value;
        let wall = getBaseConfigById(karkas.settingId).walls.filter(item => (item.id + '') === (value + ''))[0];
        karkasDepth = wall.depth / defScaleValue;
        karkas.wall = wall;
        shapes.filter(i => i.name === 'Partition').forEach(i => {
            i.setX(i.getX())
        });
        drawAll();
    });
    return htmlSelectElement;
}


function createSelect(dataToSelect, id, imageToCange) {
    let htmlSelectElement = document.createElement('select');
    htmlSelectElement.setAttribute("id", id);
    htmlSelectElement.setAttribute("style", "width: 600px");
    !!dataToSelect && dataToSelect.length > 1 && dataToSelect.forEach(i => {
        let htmlOptionElement = document.createElement('option');
        let value = i.id;
        htmlOptionElement.setAttribute("value", value);
        if (value === karkas[id].id) {
            htmlOptionElement.setAttribute("selected", 'selected');
        }
        htmlOptionElement.innerText = i.name + (showPrice ? (i.def ? ' (входит в стоимость базовой комплектации)' : (" (" + i.price + " руб)")) : '');
        htmlSelectElement.appendChild(htmlOptionElement);
    });
    htmlSelectElement.addEventListener("change", function () {
        let value = document.getElementById(id).value;
        let texture = dataToSelect.filter(i => (value + '') === (i.id + ''))[0];
        imageToCange.src = API_ROOT + IMG_URL(texture.imageSelect);
        karkas[id] = texture;
        drawAll();
        setTimeout(() => drawAll(), 500);
    });
    return htmlSelectElement;
}

function kalkulatePrice(show) {
    let priceValue = [];
    let root = document.getElementById(rootDivId);
    removeElement('price-block');
    let priceDiv = createHtmlElement(HTML_ELEMENT.DIV, {id: 'price-block'});

    if (!show && !showPrice) {
        priceDiv.setAttribute('style', 'display: none')
    }
    root.appendChild(priceDiv);
    priceDiv.appendChild(createHtmlElement(HTML_ELEMENT.H4, {text: 'Цена изделия', style: TEXT_ALIGN_CENTER}));
    let withPrice = shapes.filter(isSerialized).filter(item => !!item.price);
    let with2 = [];
    let exsist = [];
    for (let i = 0; i < withPrice.length; i++) {
        let current = withPrice[i];
        let id = (getNameToPriceTable(current) + round(current.price, 2));
        if (exsist.indexOf(i) === -1) {
            exsist.push(i);
            let count = 1;
            with2.push(current);
            withPrice.forEach((item, index) => {
                if (exsist.indexOf(index) === -1) {
                    if ((getNameToPriceTable(item) + round(item.price, 2)) === id) {
                        exsist.push(index);
                        count++;
                    }
                }
            });
            current.count = count;
        }
    }
    withPrice = with2;

    if (withPrice.length > 0) {
        let table = createHtmlElement(HTML_ELEMENT.TABLE, {});
        priceDiv.appendChild(table);
        let thead = createHtmlElement(HTML_ELEMENT.THEAD, {});
        table.appendChild(thead);
        let name = createHtmlElement(HTML_ELEMENT.TH, {
            text: 'Наименование',
            style: 'border: 2px solid #d7d2d2;padding: 7px 10px;'
        });
        let thCount = createHtmlElement(HTML_ELEMENT.TH, {
            text: 'Количество, шт',
            style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
        });
        let thUnitPrice = createHtmlElement(HTML_ELEMENT.TH, {
            text: 'Цена за единицу, руб',
            style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
        });
        let thPrice = createHtmlElement(HTML_ELEMENT.TH, {
            text: 'Цена, руб',
            style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
        });
        thead.appendChild(name);
        thead.appendChild(thUnitPrice);
        thead.appendChild(thCount);
        thead.appendChild(thPrice);
        let tBody = createHtmlElement(HTML_ELEMENT.TBODY, {});
        table.appendChild(tBody);
        let total = 0;
        withPrice.forEach((item, index) => {
            total = addRowPrice(item, tBody, total);
            if (index === 0 && karkas.wall && !karkas.wall.def) {
                total = addRowPrice({...karkas.wall, name: 'Other', count: 1}, tBody, total)
            }
            if (index === 0 && karkas['TEXTURE_OUTER'] && !karkas['TEXTURE_OUTER'].def) {
                total = addRowPrice({
                    ...karkas['TEXTURE_OUTER'],
                    description: karkas['TEXTURE_OUTER'].name,
                    name: 'Other',
                    count: 1
                }, tBody, total)
            }
            if (index === 0 && karkas['TEXTURE_INNER'] && !karkas['TEXTURE_INNER'].def) {
                total = addRowPrice({
                    ...karkas['TEXTURE_INNER'],
                    description: karkas['TEXTURE_INNER'].name,
                    name: 'Other',
                    count: 1
                }, tBody, total)
            }
            if (index === 0 && karkas['TEXTURE_FLOOR'] && !karkas['TEXTURE_FLOOR'].def) {
                total = addRowPrice({
                    ...karkas['TEXTURE_FLOOR'],
                    description: karkas['TEXTURE_FLOOR'].name,
                    name: 'Other',
                    count: 1
                }, tBody, total)
            }
        });
        let tr = createHtmlElement(HTML_ELEMENT.TR, {});
        tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
            style: 'border: 1px solid #fff;text-align: right'
        }));
        tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
            style: 'border: 1px solid #fff;text-align: right'
        }));
        tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
            text: 'Итого:',
            style: 'border: 1px solid #fff;text-align: right'
        }));
        tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
            text: round(total, 2) + 'руб.',
            style: 'font-weight: bold;;text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
        }));
        tBody.appendChild(tr);
    }
}

addRowPrice = (item, tBody, total) => {
    let tr = createHtmlElement(HTML_ELEMENT.TR, {});
    tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
        text: getNameToPriceTable(item),
        style: 'border: 2px solid #d7d2d2;padding: 7px 10px;'
    }));
    tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
        text: round(item.price, 2),
        style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
    }));
    tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
        text: item.count,
        style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
    }));
    tr.appendChild(createHtmlElement(HTML_ELEMENT.TD, {
        text: round(item.price * item.count, 2),
        style: 'text-align: right; border: 2px solid #d7d2d2;padding: 7px 10px;'
    }));
    tBody.appendChild(tr);
    return total + Number(round(Number(item.price), 2));
};

function getNameToPriceTable(item) {
    if (item.name === 'Karkas') {
        return `Базовая комплектация бытовки ${item.length}х${item.width}мм`
    } else if (item.name === 'Door') {
        return item.printName || `Дверь входная (правая/левая), ${item.getLength()}мм`
    } else if (item.name === 'Other') {
        return item.description
    } else if (item.name === 'InnerDoor') {
        return item.printName || `Дверь межкомнатная (правая/левая), ${item.getLength()}мм`
    } else if (item.name === 'Window') {
        return item.hint
    } else if (item.name === 'Partition') {
        let length = (item.getLength() > item.getWidth()) ? round(item.getLength()) : round(item.getWidth());
        return `Перегородка межкомнатная ${length}мм`
    } else {
        return item.nameRu
    }
}

function clearControlButton(shape) {
    return {...shape, relatedShapes: [], fixed: true}
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function drawHint(ctx, x, y, text = 'Подсказка') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y - 30, 10 + text.length * 11, 20);
    ctx.strokeStyle = "rgba(0,0,0,0.41)";
    ctx.fillStyle = colorWhite;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.86)";
    ctx.font = "italic 12pt Arial";
    ctx.fillText(text, x + 15, y - 13);
    ctx.restore();
    ctx.closePath();
}

function getSelectedShape() {
    return shapes.filter(item => item.getId() === selectedShapeId)[0];
}

function createFromTemplate(data) {
    let newShape = [];
    let arr = JSON.parse(data);
    arr.forEach(item => {
        let obj = item;
        switch (obj.name) {
            case 'Karkas':
                let karkas1 = Karkas.from(obj);
                karkas1.id = obj.id;
                initTextures(getBaseConfigById(obj.settingId));
                karkas = karkas1;
                karkas.setX(100);
                karkas.setY(70);
                newShape.push(karkas1);
                break;
            case 'Door':
                let assign = Object.assign(new Door(), obj);
                assign.id = obj.id;
                newShape.push(assign);
                break;
            case 'Window':
                let assign1 = Object.assign(new Window(), obj);
                assign1.id = obj.id;
                newShape.push(assign1);
                break;
            case 'Partition':
                let assign2 = Object.assign(new Partition(), obj);
                assign2.id = obj.id;
                newShape.push(assign2);
                break;
            case 'Arrow':
                let assign3 = Object.assign(new Arrow(), obj);
                assign3.id = obj.id;
                newShape.push(assign3);
                break;
            case 'InnerDoor':
                let assign4 = Object.assign(new InnerDoor(), obj);
                assign4.id = obj.id;
                newShape.push(assign4);
                break;
            case 'Light':
                let assign5 = Object.assign(new Light(), obj);
                assign5.id = obj.id;
                newShape.push(assign5);
                break;
        }
    });
    shapesMap = new Map();
    newShape.forEach(item => {
        shapesMap.set(item.getId(), item);
    });
    shapes = newShape;
    changePositionAndScale();
    drawAll();
}

function getShapeById(id) {
    return shapesMap.get(id);
}

//-------------------------------------------------------------------------//
//--------- Серилизация и дэсерелизация из sessionStorage  ---------------//

function isSerialized(shape) {
    let notSerialised = ['DragElement', 'ChangeSizeElement', 'ChangeOpenTypeButton', 'AddInnerDoorButton', 'MirrorButton', 'DeleteButton', 'EditButton', 'ConfirmButton', 'TurnButton'];
    return notSerialised.indexOf(shape.name) === -1
}

function setToSession(item) {
    sessionStorage.setItem('shapes', JSON.stringify(item))
}

function deserialize() {
    let i = 0;
    let newShape = [];
    if (sessionStorage.getItem('shapes') !== 'undefined' && sessionStorage.getItem('shapes') !== null) {
        let arr = JSON.parse(sessionStorage.getItem('shapes'));
        arr.forEach(obj => {
            switch (obj.name) {
                case 'Karkas':
                    let karkas1 = Karkas.from(obj);
                    karkas1.id = obj.id;
                    karkas = karkas1;
                    initTextures(getBaseConfigById(obj.settingId));
                    karkas.setX(100);
                    karkas.setY(70);
                    newShape.push(karkas1);
                    break;
                case 'Door':
                    let assign = Object.assign(new Door(), obj);
                    assign.id = obj.id;
                    newShape.push(assign);
                    break;
                case 'Window':
                    let assign1 = Object.assign(new Window(), obj);
                    assign1.id = obj.id;
                    newShape.push(assign1);
                    break;
                case 'Partition':
                    let assign2 = Object.assign(new Partition(), obj);
                    assign2.id = obj.id;
                    newShape.push(assign2);
                    break;
                case 'Arrow':
                    let assign3 = Object.assign(new Arrow(), obj);
                    assign3.id = obj.id;
                    newShape.push(assign3);
                    break;
                case 'InnerDoor':
                    let assign4 = Object.assign(new InnerDoor(), obj);
                    assign4.id = obj.id;
                    newShape.push(assign4);
                    break;
                case 'Light':
                    let assign5 = Object.assign(new Light(), obj);
                    assign5.id = obj.id;
                    newShape.push(assign5);
                    break;
            }
        })
    }
    shapesMap = new Map();
    newShape.forEach(item => {
        shapesMap.set(item.getId(), item);
    });
    shapes = newShape;
    drawAll();
}

function serialize() {
    sessionStorage.clear();
    setToSession(shapes.filter(isSerialized).map(clearControlButton));
}

//-------------------------------------------------------------------------//
//---------------------- Рисование простых фигур --------------------------//

function drawChangeOpen(ctx, x, y, length, width) {
    let scaleValue1 = getScaleValue(1);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + (width / 2) - scaleValue1);
    ctx.lineTo(x + length, y + (width / 2) - scaleValue1);
    ctx.lineTo(x, y);
    ctx.moveTo(x, y + (width / 2) + scaleValue1);
    ctx.lineTo(x + length, y + (width / 2) + scaleValue1);
    ctx.lineTo(x, y + width);
    ctx.lineTo(x, y + (width / 2) + scaleValue1);
}

function drawMirror(ctx, x, y, length, height) {
    let scaleValue1 = getScaleValue(1);
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + (length / 2) - scaleValue1, y);
    ctx.lineTo(x + (length / 2) - scaleValue1, y + height);
    ctx.lineTo(x, y + height);
    ctx.moveTo(x + length, y + height);
    ctx.lineTo(x + (length / 2) + scaleValue1, y);
    ctx.lineTo(x + (length / 2) + scaleValue1, y + height);
    ctx.lineTo(x + length, y + height);
}

/**
 * Отрисовка стрелки указывающей вниз
 * @param ctx конткст для рисования
 * @param x координата x точки на которую указывает стрелка
 * @param y координата y точки на которую указывает стрелка
 * @param length ширина стрелки
 * @param height высота стрелки
 */
function drawBottomArrow(ctx, x, y, length = 10, height = 20) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length / 2, y - height);
    ctx.lineTo(x - length / 2, y - height);
    ctx.lineTo(x, y);
}

/**
 * Отрисовка стрелки указывающей вправо
 * @param ctx конткст для рисования
 * @param x координата x точки на которую указывает стрелка
 * @param y координата y точки на которую указывает стрелка
 * @param length ширина стрелки
 * @param height высота стрелки
 */
function drawRightArrow(ctx, x, y, length = 20, height = 10) {
    ctx.moveTo(x, y);
    ctx.lineTo(x - length, y + height / 2);
    ctx.lineTo(x - length, y - height / 2);
    ctx.lineTo(x, y);
}

/**
 * Отрисовка стрелки указывающей влево
 * @param ctx конткст для рисования
 * @param x координата x точки на которую указывает стрелка
 * @param y координата y точки на которую указывает стрелка
 * @param length ширина стрелки
 * @param height высота стрелки
 */
function drawLeftArrow(ctx, x, y, length = 20, height = 10) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + height / 2);
    ctx.lineTo(x + length, y - height / 2);
    ctx.lineTo(x, y);
}

/**
 * Отрисовка стрелки указывающей вверх
 * @param ctx конткст для рисования
 * @param x координата x точки на которую указывает стрелка
 * @param y координата y точки на которую указывает стрелка
 * @param length ширина стрелки
 * @param height высота стрелки
 */
function drawTopArrow(ctx, x, y, length = 10, height = 20) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length / 2, y + height);
    ctx.lineTo(x - length / 2, y + height);
    ctx.lineTo(x, y);
}

/**
 * Отрисовка крестика
 * @param ctx
 * @param x
 * @param y
 * @param length
 * @param height
 */
function drawCross(ctx, x, y, length, height) {
    ctx.moveTo(x + length / 2, y);
    ctx.lineTo(x + length / 2, y + height);
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + length, y + height / 2);
}

/**
 * Отрисовка горизонтальной двери
 * @param ctx контекст для рисования
 * @param x координата x левой верхней точки
 * @param y координата y левой верхней точки
 * @param length длина
 * @param width ширина
 * @param openingType тип открытия, внутрь, в наружу
 * @param direction левая или правая дверь
 */
function drawGorizontalDoor(ctx, x, y, length, width, openingType, direction = DIRECTION.RIGHT, isPartition = false) {

    let fonColor = colorWhite;
    let baseColor = colorBlack;
    let borderColor = "rgb(0,0,255)";

    //белая область
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y - 1, length, width + 2);
    ctx.strokeStyle = fonColor;
    ctx.fillStyle = fonColor;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    //дверь
    ctx.beginPath();
    ctx.strokeStyle = colorBlack;
    switch (direction) {
        case "RIGHT":
            switch (openingType) {
                case OPENING_TYPE.OUT:
                    ctx.arc(x + length, y - (isPartition ? 430 : 420) / scale, 935 / scale, Math.PI * 2.5, Math.PI * 2.828, false);
                    ctx.moveTo(x + length, y);
                    ctx.lineTo(x + length, y + 510 / scale);
                    break;
                case OPENING_TYPE.IN:
                    ctx.arc(x + length, y + 400 / scale, 900 / scale, Math.PI * 3.145, Math.PI * 1.5, false);
                    ctx.moveTo(x + length, y);
                    ctx.lineTo(x + length, y - 505 / scale);
                    break;
            }
            break;
        case "LEFT":
            switch (openingType) {
                case OPENING_TYPE.OUT:
                    ctx.arc(x, y - 400 / scale, 905 / scale, Math.PI * 2.155, Math.PI * 2.5, false);
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + 505 / scale);
                    break;
                case OPENING_TYPE.IN:
                    ctx.arc(x, y + 400 / scale, 900 / scale, Math.PI * 1.5, Math.PI * 1.855, false);
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y - 505 / scale);
                    break;
            }
            break;
    }
    ctx.strokeStyle = baseColor;
    ctx.stroke();
    ctx.closePath();

    //синие боковушки стены
    let depth = isPartition ? defPartitionWidth / scale : karkasDepth * defScaleValue / scale;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + depth);
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length, y + depth);
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
}

function drawVertikalWindow(x, y, length, width) {
    //белый фон для скрытия стенки
    ctx.save();
    drawRect(x - 1, y, width + 2, length, colorWhite, colorWhite);
    drawRect(x, y, width, length, "rgba(0,0,0,0.41)");

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.moveTo(x, y + length);
    ctx.lineTo(x + width, y + length);
    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

function drawRect(x, y, length, height, color, fillStyle) {
    ctx.beginPath();
    ctx.rect(x, y, length, height);
    ctx.strokeStyle = color;
    ctx.stroke();
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    ctx.closePath();
}

function drawGorizontalWindow(x, y, length, height) {
    //белый фон для скрытия стенки
    ctx.save();
    drawRect(x, y - 1, length, length + 2, colorWhite, colorWhite);
    drawRect(x, y, length, height, "rgba(0,0,0,0.41)");

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length, y + height);
    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

/**
 * Отрисовка вертикальной двери
 * @param ctx контекст для рисования
 * @param x координата x левой верхней точки
 * @param y координата y левой верхней точки
 * @param length длина
 * @param width ширина
 * @param openingType тип открытия, внутрь, в наружу
 * @param direction левая или правая дверь
 */
function drawVertikalDoor(ctx, x, y, length, width, openingType, direction = DIRECTION.RIGHT) {

    let fonColor = colorWhite;
    let baseColor = colorBlack;
    let borderColor = "rgb(0,0,255)";

    //белая область
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 1, y, length + 2, width);
    ctx.strokeStyle = fonColor;
    ctx.fillStyle = fonColor;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    //дверь
    ctx.beginPath();
    ctx.strokeStyle = colorBlack;
    switch (direction) {

        case DIRECTION.RIGHT:
            switch (openingType) {
                case OPENING_TYPE.OUT:
                    ctx.arc(x + length - 400 / scale, y, 900 / scale, Math.PI * 2.0, Math.PI * 2.355, false);
                    ctx.moveTo(x + length, y);
                    ctx.lineTo(x + length + 505 / scale, y);
                    break;
                case OPENING_TYPE.IN:
                    ctx.arc(x + 400 / scale, y, 900 / scale, Math.PI * 0.65, Math.PI, false);
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 505 / scale, y);
                    break;
            }
            break;
        case DIRECTION.LEFT:
            switch (openingType) {
                case OPENING_TYPE.OUT:
                    ctx.arc(x + length - 400 / scale, y + width, 900 / scale, Math.PI * 1.645, Math.PI * 2, false);
                    ctx.moveTo(x + length, y + width);
                    ctx.lineTo(x + length + 505 / scale, y + width);

                    break;
                case OPENING_TYPE.IN:
                    ctx.arc(x + 400 / scale, y + width, 900 / scale, Math.PI, Math.PI * 1.355, false);
                    ctx.moveTo(x, y + width);
                    ctx.lineTo(x - 505 / scale, y + width);
                    break;
            }
            break;


    }
    ctx.strokeStyle = baseColor;
    ctx.stroke();
    ctx.closePath();

    //синие боковушки стены
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + karkasDepth, y);
    ctx.moveTo(x, y + width);
    ctx.lineTo(x + karkasDepth, y + width);
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
}

function drawAddDoor(ctx, x, y, length, width) {

    ctx.moveTo(x, y);
    ctx.lineTo(x, y + width);
    ctx.lineTo(x + length - getScaleValue(3), y + width);
    ctx.lineTo(x + length - getScaleValue(3), y);
    ctx.lineTo(x, y);
    ctx.lineTo(x + length - getScaleValue(4), y - getScaleValue(3));
    ctx.lineTo(x + length - getScaleValue(5), y);
    ctx.moveTo(x + length - getScaleValue(7), y + width / 2);
    ctx.lineTo(x + length - getScaleValue(5), y + width / 2);

}

function drawWhiteRectangle(x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 2, y - 2, w + 4, h + 4);
    ctx.strokeStyle = colorWhite;
    ctx.fillStyle = colorWhite;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.restore();

}

function round(number, digit = 0) {
    if (number) {
        return Number(number).toFixed(digit);
    }
    return 0;
}

const templates = [
    {
        name: 'СБ1-6',
        img: 'https://xn--90acsfcjpnu1gc.xn--p1ai/wp-content/uploads/2020/02/sb1-7ch1.png',
        data: '[{"id":"04fb0573-bc29-4cbd-9f08-d297851b9e74","x":100,"y":70,"width":6000,"height":2400,"color":"rgb(0,0,255)","notDragable":true,"fixed":true,"name":"Karkas","arrowsId":["297d6d4e-d71f-4606-b76d-030dbfa598a8","addd1d78-c2c7-43cf-b986-a47877fedef9"],"relatedShapes":[],"price":80000,"nameRu":"Каркас"},{"id":"297d6d4e-d71f-4606-b76d-030dbfa598a8","x":100,"y":20,"width":6000,"color":"rgba(0,0,0,0.41)","text":"6000 мм","notDragable":true,"fixed":true,"name":"Arrow","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"type":"TOP","relatedShapes":[]},{"id":"addd1d78-c2c7-43cf-b986-a47877fedef9","x":100,"y":120,"width":2400,"color":"rgba(0,0,0,0.41)","text":"2400 мм","notDragable":true,"fixed":true,"name":"Arrow","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"type":"LEFT","relatedShapes":[]},{"id":"fda3c3dd-88b6-4712-ba3b-d5af5b3cbbb5","x":409.5238095238095,"y":347.3809523809524,"width":800,"height":8.333333333333332,"color":"rgba(0, 0, 0)","notDragable":false,"fixed":true,"name":"Door","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":["eddf9701-dd72-43c9-aaf0-474eaa76ad85"],"relatedShapes":[],"shift":43.52999973333346,"position":"BOTTOM","direction":"RIGHT","opening":"OUT","nameRu":"дверь","price":5000},{"id":"eddf9701-dd72-43c9-aaf0-474eaa76ad85","x":409.5238095238095,"y":297.3809523809524,"width":800,"color":"rgba(0,0,0,0.41)","notDragable":true,"fixed":true,"name":"Arrow","parentId":"fda3c3dd-88b6-4712-ba3b-d5af5b3cbbb5","arrowsId":[],"type":"TOP","relatedShapes":[]},{"id":"4d364167-19ba-4e16-ad5c-bad41a63756c","x":338.0952380952381,"y":212.85714285714286,"width":50,"height":2252.000000000001,"color":"rgb(0,0,255)","notDragable":false,"fixed":true,"name":"Partition","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"relatedShapes":[],"doorId":"d0f7fda3-95d0-4421-9fa0-00367e3ad6dc","price":11260,"positionTop":2.916666666666666,"positionRight":36.889999533333345,"nameRu":"перегородку"},{"id":"5c437363-9193-48be-8539-c9821ceaa6b5","x":338.0952380952381,"y":212.85714285714286,"width":50,"height":2260.4000000000015,"color":"rgb(0,0,255)","notDragable":false,"fixed":true,"name":"Partition","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"relatedShapes":[],"doorId":"2060ca14-8825-4392-a813-cb43b0fb47c7","price":11302,"positionTop":2.900000000000017,"positionRight":62.88333333333338,"nameRu":"перегородку"},{"id":"d0f7fda3-95d0-4421-9fa0-00367e3ad6dc","x":291.96428571428567,"y":472.6190476190477,"width":800,"height":50,"color":"rgba(0, 0, 0)","notDragable":false,"fixed":true,"name":"InnerDoor","parentId":"4d364167-19ba-4e16-ad5c-bad41a63756c","arrowsId":[],"relatedShapes":[],"shift":50,"direction":"LEFT","opening":"IN","position":"RIGHT","nameRu":"дверь"},{"id":"2060ca14-8825-4392-a813-cb43b0fb47c7","x":291.96428571428567,"y":473.61904761904776,"width":800,"height":50,"color":"rgba(0, 0, 0)","notDragable":false,"fixed":true,"name":"InnerDoor","parentId":"5c437363-9193-48be-8539-c9821ceaa6b5","arrowsId":[],"relatedShapes":[],"shift":50,"direction":"RIGHT","opening":"OUT","position":"RIGHT","nameRu":"дверь"},{"id":"d30a4972-e670-45a4-8cab-4143807c3869","x":213.09523809523807,"y":347.3809523809524,"width":800,"height":8.333333333333332,"color":"rgba(0, 0, 0)","notDragable":false,"fixed":true,"name":"Window","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":["e7fa9af8-5b63-4404-bc63-ec4707ddf405"],"relatedShapes":[],"shift":11.07333333333333,"position":"BOTTOM","nameRu":"окно","price":5000},{"id":"e7fa9af8-5b63-4404-bc63-ec4707ddf405","x":213.09523809523807,"y":397.3809523809524,"width":800,"color":"rgba(0,0,0,0.41)","notDragable":true,"fixed":true,"name":"Arrow","parentId":"d30a4972-e670-45a4-8cab-4143807c3869","arrowsId":[],"type":"BOTTOM","relatedShapes":[]},{"id":"4c08018c-4f7f-417e-9d00-949ff0f237bd","x":213.09523809523807,"y":347.3809523809524,"width":800,"height":8.333333333333332,"color":"rgba(0, 0, 0)","notDragable":false,"fixed":true,"name":"Window","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":["a612ebb3-326b-4d7b-8a22-b612d811f5fd"],"relatedShapes":[],"shift":75.31333333333352,"position":"BOTTOM","nameRu":"окно","price":5000},{"id":"a612ebb3-326b-4d7b-8a22-b612d811f5fd","x":405.9523809523809,"y":397.3809523809524,"width":800,"color":"rgba(0,0,0,0.41)","notDragable":true,"fixed":true,"name":"Arrow","parentId":"4c08018c-4f7f-417e-9d00-949ff0f237bd","arrowsId":[],"type":"BOTTOM","relatedShapes":[]},{"id":"339bfc35-5835-4867-a5dd-1d4264ca1d3a","x":278.57142857142856,"y":212.85714285714286,"width":200,"height":200,"color":"rgba(0,0,0,0.41)","notDragable":false,"fixed":true,"name":"Light","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"relatedShapes":[],"positionTop":45.699999999999974,"positionRight":16.173333200000002,"nameRu":"светильник","price":500},{"id":"8b8935bd-7c6b-49fc-9476-d39c1eac3546","x":278.57142857142856,"y":212.85714285714286,"width":200,"height":200,"color":"rgba(0,0,0,0.41)","notDragable":false,"fixed":true,"name":"Light","parentId":"04fb0573-bc29-4cbd-9f08-d297851b9e74","arrowsId":[],"relatedShapes":[],"positionTop":45.69999999999985,"positionRight":80.27333280000012,"nameRu":"светильник","price":500}]'
    }];

document.getElementsByTagName("head")[0].appendChild(css);
requests.get('/base-config').then(rs => {
    baseConfig = rs;
});
initElement();
