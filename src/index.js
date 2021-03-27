function bootstrapDAPP() {
    let contract;

    this.createItem = async function (taskDetail) {
        let contract = await getContract();
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        await contract.methods.addTask(taskDetail).send({ from: accounts[0] });
    }

    this.getItems = async function () {
        let contract = await getContract();
        let totalTasks = await contract.methods.taskCount().call();
        let allTasks = [];
        for (let index = 1; index <= totalTasks; index++) {
            var message = await contract.methods.tasks(index).call();
            allTasks[index - 1] = message;
        }
        return allTasks;
    }

    this.markComplete = async function (id) {
        let contract = await getContract();
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        await contract.methods.completeTask(+id).send({ from: accounts[0] });
    }

    async function getContract() {
        const contractAddress = "0x36C239754471a52DB52910D25D52Bf6C97c225bC";
        if (!contract) {
            if (window.ethereum) {
                window.web3 = new Web3(ethereum);
                try {
                    // Request account access if needed
                    await ethereum.enable();
                } catch (error) {
                    console.error(error);
                    // User denied account access...
                }
                contract = new web3.eth.Contract(abi, contractAddress);
            }
            else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        }
        return contract;
    }
}

window.addEventListener('load', async () => {
    let dapp = new bootstrapDAPP();
    document.getElementById('btnCreate').addEventListener('click', async () => {
        await dapp.createItem(document.getElementById('taskDetail').value);
        const allItems = await dapp.getItems();
        bindList(allItems);
    });

    function bindList(allItems) {
        const rootDOM = document.getElementsByClassName('list-group')[0];
        rootDOM.innerHTML='';
        allItems.forEach(item => {
            const anchor = document.createElement('a')
            anchor.addEventListener('click', () => loadPopup(item.id, item.content, item.completed));
            anchor.setAttribute('class','list-group-item list-group-item-action');
            anchor.setAttribute('data-toggle','modal');
            anchor.setAttribute('data-target','#modalDetail');
            anchor.innerText = item.content;
            anchor.setAttribute('href','#');
            rootDOM.appendChild(anchor);
            
        });
    }
    
    function loadPopup(id, content, completed) {
        document.getElementById('detail').innerHTML = content;
        document.getElementById('id').innerHTML = id;
        document.getElementById('status').innerHTML = completed;
        const markCompleteBtn = document.getElementById('btnComplete');
        const clonedBtn = markCompleteBtn.cloneNode(true);             
        //document.getElementById('btnComplete').removeEventListener('click', complete, true);
        clonedBtn.addEventListener('click', complete);
        markCompleteBtn.parentNode.replaceChild(clonedBtn, markCompleteBtn);   

        async function complete() {
            await dapp.markComplete(id);
            $('#modalDetail').modal('hide');
            const allItems = await dapp.getItems();
            bindList(allItems);
        }
    }

    //Initially load the list
    const allItems = await dapp.getItems();
    bindList(allItems);
});


