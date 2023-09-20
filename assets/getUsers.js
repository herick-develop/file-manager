/* jshint esversion: 6 */

const btnUser = document.querySelectorAll(".btn-user");
const $buttonActive = document.querySelectorAll(".btn-active");
const $buttonDelete = document.querySelectorAll(".btn-excluir");
const inputArray = document.getElementById("input-array");
const ulList = document.getElementById("ul-list");

const valueObject = {};

function updateValueObject(button) {

   const id = button.getAttribute('user'); // Converte o id para número
   console.log(id);
   const isActive = !button.classList.contains('btn-warning');
   let deleteValue = false;
 
   if (button.classList.contains("btn-excluir")) {
     deleteValue = true;
   }
  
   return {
     id: id,
     ativo: isActive,
     delete: deleteValue
   };
 }
 function updateInputArray() {
   const updatedValueArray = Object.values(valueObject).filter(item => item.ativo !== "" || item.delete !== true);
   inputArray.value = JSON.stringify(updatedValueArray);
 }
 
 // Delegação de eventos para os botões
 document.addEventListener("click", (event) => {
   const target = event.target;
   
   if (target.classList.contains("btn-active") || target.classList.contains("btn-warning")) {
     // Atualize o objeto valueObject
     valueObject[target.id] = updateValueObject(target);
 
     // Troque a classe do botão e atualize o campo de entrada
     target.classList.toggle('btn-warning');
     target.classList.toggle('btn-success');
     target.innerText = target.innerText === "Ativar" ? "Inativar" : "Ativar";
 
     // Atualize o campo de entrada
     updateInputArray();
   } else if (target.classList.contains("btn-excluir")) {

    console.log(target.parentNode.parentNode.childElementCount);

    for (let i = 0; i < target.parentNode.parentNode.childElementCount; i++) {
      const child = target.parentNode.parentNode.children[i];

      console.log(child);
    
      for (let j = 0; j < child.childElementCount; j++) {
        const grandchild = child.children[j];

        console.log("g: ",grandchild);

        grandchild.style = "text-decoration: line-through";
        grandchild.setAttribute("disabled", true);
      }
    }

     valueObject[target.id] = updateValueObject(target);

     updateInputArray();
   }
 });

async function createUser() {

  //  try {
  //     const response = await fetch('@getUser', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  //     console.log('Data received:', data);
  //  } catch (error) {
  //     console.error('Error:', error);
  //  }

  //  // Suponhamos que você tenha os dados para preencher esses elementos
  //  const id = 1;
    const ativo = true;

   // Crie um elemento li
   const listItem = document.createElement("li");
   listItem.className = "list-group-item d-flex justify-content-between align-items-center";

   // Crie um elemento span dentro do li
   const span = document.createElement("span");
   span.className = "d-flex";

   // Crie um elemento de texto para o nome
   const containnerInput = document.createElement("div");
   const nomeText = document.createElement("input");
   nomeText.placeholder = "Nome de usuário";
   nomeText.className = "inputNewUser";
   nomeText.name = "nomeNewUser";
   nomeText.setAttribute("required", "");

   const emailText = document.createElement("input");
   emailText.placeholder = "email de usuário";
   emailText.className = "inputNewUser";
   emailText.name = "emailNewUser";
   emailText.type = "email";
   emailText.setAttribute("required", "");

   const passText = document.createElement("input");
   passText.placeholder = "senha de usuário";
   passText.className = "inputNewUser";
   passText.type = "password";
   passText.name= "passNewUser";
   passText.setAttribute("required", "");


   // Crie um botão "Ativar" ou "Inativar" com base no valor de "ativo"
  //  const ativarInativarButton = document.createElement("button");
  //  ativarInativarButton.type = "button";
  //  ativarInativarButton.className = ativo
  //  ? "btn btn-inativar btn-warning me-2 btn-equal btn-active btn-user"
  //  : "btn btn-ativar btn-success me-2 btn-equal btn-active btn-user";
  //  ativarInativarButton.innerText = ativo ? "Inativar" : "Ativar";

   // Crie um botão "Excluir"
   const excluirButton = document.createElement("button");
   excluirButton.type = "button";
   excluirButton.className = "btn btn-excluir btn-danger btn-equal btn-user";
   excluirButton.innerText = "Excluir";

   // Crie um elemento input para o array (se necessário)
  //  const inputArray = document.createElement("input");
  //  inputArray.name = "inputArray";
  //  inputArray.type = "text";
  //  inputArray.id = "input-array";
  //  inputArray.hidden = true;
  //  inputArray.readOnly = true;

   // Adicione todos os elementos criados ao documento
   containnerInput.appendChild(nomeText);
   containnerInput.appendChild(emailText);
   containnerInput.appendChild(passText);
  //  span.appendChild(ativarInativarButton);
   span.appendChild(excluirButton);
   //span.appendChild(inputArray);
   listItem.appendChild(containnerInput);
   
   listItem.appendChild(span);

   // Adicione o elemento li ao seu contêiner ou à lista

   ulList.appendChild(listItem);
}