export function focusPlannerField(form:HTMLFormElement,fields:string[]){
 const input=Array.from(form.querySelectorAll<HTMLElement>('[data-planner-field]')).find(node=>fields.includes(node.dataset.plannerField??''));
 if(!input)return;
 let parent=input.parentElement;
 while(parent&&parent!==form){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
 input.focus();
}
