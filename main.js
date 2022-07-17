const input_fullName = document.getElementById('input_fullName');
const input_address = document.getElementById('input_address');
const input_phoneNumber = document.getElementById('input_phoneNumber');
const input_email = document.getElementById('input_email');
const input_intro = document.getElementById('input_intro');
const preview_fullName = document.getElementById('preview_fullName');
const preview_address = document.getElementById('preview_address');
const preview_phoneNumber = document.getElementById('preview_phoneNumber');
const preview_email = document.getElementById('preview_email');
const preview_intro = document.getElementById('preview_intro');
const preview_extraLinks = document.getElementById('preview_extraLinks');
const attrs = ['name', 'title', 'link', 'duration', 'location'];
const loadData = async () => {
    const data = await fetch('./resume.json').then(res => res.json());
    initiateValues(data);
}
const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
const initiateValues = (data) => {
    input_fullName.value = data.name;
    input_address.value = data.contact.address;
    input_phoneNumber.value = data.contact.phone;
    input_email.value = data.contact.email;
    input_intro.value = data.intro;

    preview_fullName.textContent = data.name;
    preview_address.textContent = data.contact.address;
    preview_phoneNumber.textContent = data.contact.phone;
    preview_email.textContent = data.contact.email;
    preview_intro.textContent = data.intro;
    if (data.extraLinks && data.extraLinks.length) {
        const htmlString = data.extraLinks.map((item, index) => {
            let str = `<a href=${item.link} target="_blank" class="link">
                ${item.displayText}
            </a>`;
            if (index % 2 === 0) str += ' | ';
            return str;
        }).join('');
        preview_extraLinks.innerHTML = htmlString;
    }
    if (data.sections && data.sections.length) {
        populateSectionsForResumeContent(data.sections);
        populateSectionsForEditorContent(data.sections);
    }
}
const onKeyUp = (element) => {
    const targetId = element.getAttribute('dataTarget');
    const target = document.getElementById(targetId);
    if (!target) return;
    target.textContent = element.value;
    if (target.classList.contains('link')) target.href = element.value;
}
const populateSectionsForResumeContent = (sections) => {
    const htmlString = sections.map((section, index) => {
        const content = section.items.map((subItem, subIndex) => {
            const lis = subItem.highlights.map(str => {
                if (!str) return '';
                return `<li>${str}</li>`
            }).join('');
            const ul = lis ? `<ul class="Highlights">${lis}</ul>` : '';
            const anchor = (subItem.link) ? `<a id="preview_link_${index}_${subIndex}" href="${subItem.link}" target="_blank" class="link">${subItem.link}</a>` : '';
            const location = (subItem.location) ? `<p id="preview_location_${index}_${subIndex}">${subItem.location}</p>` : '';
            const duration = (subItem.duration) ? `<p id="preview_duration_${index}_${subIndex}">${subItem.duration}</p>` : '';
            const _htmlString = `
                <div class="BorderTop Item">
                    <div class="ItemTitle">
                        <p id="preview_name_${index}_${subIndex}">${subItem.name}</p>
                        ${location}
                    </div>
                    <div class="ItemSubTitle">
                        <p id="preview_title_${index}_${subIndex}">${subItem.title}</p>
                        ${duration}
                    </div>
                    ${anchor}
                    ${ul}
                </div>
            `;
            return _htmlString;
        }).join('');
        const str = `
            <div class="Section" id="SectionContainer_${index}">
                <h3 class="SectionHeader" 
                    id="preview_SectionHeader_${index}">
                    ${section.displayText}
                </h3>
                ${content}
            </div>
        `;
        return str;
    }).join('');
    preview_intro.insertAdjacentHTML('afterend', htmlString);
}
const getInputItemContainer = (htmlString) => {
    return `
        <div class="InputItem">
            ${htmlString}
        </div>
    `;
}
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const populateAccordionTextInput = (attrName, item, index, subIndex) => {
    return `
        <label>${capitalizeFirstLetter(attrName)}</label>
        <input 
            id="input_${attrName}_${subIndex}"
            dataTarget="preview_${attrName}_${index}_${subIndex}"
            class="textInput" 
            value="${item[attrName] ? item[attrName] : ''}"/>
    `;
}
const populateAccordionContent = (index, items) => {
    const htmlString = items.map((item, subIndex) => {
        const inputContainers = attrs.map(
            attr => getInputItemContainer(populateAccordionTextInput(attr, item, index, subIndex))
        ).join('');
        return `
            <br/>
            ${inputContainers}
            <details class="HighlightAccordion">
                <summary>Highlights</summary>
            </details>
            <hr/>
        `;
    }).join('');
    return htmlString;
}
const populateReorderButton = (index, val, text, className, idPrefix) => {
    return `
        <button
            id="${idPrefix}_${index}"
            parentId="SectionAccordion_${index}"
            dataTarget="SectionContainer_${index}"
            ${index === val ? 'disabled' : ''} 
            class="${className}">
            ${text}
        </button>`;
}
const populateSectionsForEditorContent = (sections) => {
    const htmlString = sections.map((section, index) => {
        const upBtn = populateReorderButton(index, 0, '🡹', 'moveUpBtn', 'upBtn');
        const downBtn = populateReorderButton(index, sections.length - 1, '🡻', 'moveDownBtn', 'downBtn');
        const accordion = `<details open
            class="SectionAccordion"
            id="SectionAccordion_${index}">
            <summary>
                ${upBtn}
                ${downBtn}
                <button
                    parentId="SectionAccordion_${index}"
                    dataTarget="SectionContainer_${index}"
                    class="deleteBtn">
                    –
                </button>
                <input 
                    type="text"
                    class="textInput"
                    dataTarget="preview_SectionHeader_${index}"
                    value="${section.displayText}"
                />
            </summary>
            <div class="AccordionContent">
                ${populateAccordionContent(index, section.items)}
            </div>
        </details>`;
        return accordion;
    }).join('');
    document.getElementById('EditorContainer').insertAdjacentHTML('beforeend', htmlString);
}
const swapElements = (obj1, obj2) => {
    const temp = document.createElement("div");
    obj1.parentNode.insertBefore(temp, obj1);
    obj2.parentNode.insertBefore(obj1, obj2);
    temp.parentNode.insertBefore(obj2, temp);
    temp.parentNode.removeChild(temp);
}
const deleteSection = (element) => {
    const targetId = element.getAttribute('dataTarget');
    const target = document.getElementById(targetId);
    if (!target) return;
    target.parentNode.removeChild(target);
    const parentId = element.getAttribute('parentId');
    const parent = document.getElementById(parentId);
    if (!parent) return;
    parent.parentNode.removeChild(parent);
}
const reorderSectionList = (btn, queryClass, value) => {
    const accordions = getSectionAccordions();
    for (let i = 0; i < accordions.length; i++) {
        const accBtn = accordions[i].querySelector(queryClass);
        if (accBtn.id !== btn.id) continue;
        const parentId = btn.getAttribute('parentId');
        const toSwapAccordion = document.getElementById(parentId);
        swapElements(toSwapAccordion, accordions[i + value]);
        const targetId1 = btn.getAttribute('dataTarget');
        const target1 = document.getElementById(targetId1);
        const btn2 = accordions[i + value].querySelector(queryClass);
        const targetId2 = btn2.getAttribute('dataTarget');
        const target2 = document.getElementById(targetId2);
        swapElements(target1, target2);
        updateUpDownButtonStates();
        return;
    }
}
const updateUpDownButtonStates = () => {
    const newList = getSectionAccordions();
    newList.forEach((ele, index) => {
        ele.querySelector('.moveUpBtn').disabled = (index === 0) ? true : false;
        ele.querySelector('.moveDownBtn').disabled = (index === newList.length - 1) ? true : false;
    });
}
const getSectionAccordions = () => {
    const elements = Array.from(document.getElementsByClassName('SectionAccordion'));
    return elements;
}
loadData().then(() => {
    Array.from(document.getElementsByClassName('textInput')).forEach(ele => {
        ele.onkeyup = () => debounce(onKeyUp(ele), 300);
    });
    Array.from(document.getElementsByClassName('deleteBtn')).forEach(btn => {
        btn.onclick = () => deleteSection(btn);
    });
    Array.from(document.getElementsByClassName('moveDownBtn')).forEach(btn => {
        btn.onclick = () => reorderSectionList(btn, '.moveDownBtn', 1);
    });
    Array.from(document.getElementsByClassName('moveUpBtn')).forEach(btn => {
        btn.onclick = () => reorderSectionList(btn, '.moveUpBtn', -1);
    });
    document.getElementById('printBtn').onclick = () => printResume();
});
const printResume = () => {
    const printContents = document.querySelector('.Preview').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}