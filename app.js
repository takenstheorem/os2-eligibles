document.addEventListener('DOMContentLoaded', function () {
    const tableContainer = document.getElementById('table-container');
    const searchInput = document.getElementById('search-input');

    fetch('dataClean.csv')
        .then(response => response.text())
        .then(text => {
            Papa.parse(text, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    createSortableTable(tableContainer, results.data);
                    searchInput.addEventListener('input', function () {
                        const query = searchInput.value.toLowerCase();
                        filterTable(query, results.data);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading CSV file:', error));

    function createSortableTable(parentElement, data) {
        parentElement.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('sortable');

        const thead = document.createElement('thead');
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        Object.keys(data[0]).forEach(function (columnName) {
            const th = document.createElement('th');
            th.textContent = columnName;
            th.classList.add('sortable');

            th.addEventListener('click', function (event) {
                sortColumn(table, event.target);
            });

            thead.appendChild(th);
        });

        data.forEach(function (rowData) {
            const tr = document.createElement('tr');
            tbody.appendChild(tr);

            Object.keys(rowData).forEach(function (keyValue) {
                const td = document.createElement('td');
                viewable = String(rowData[keyValue]);
                if (keyValue == 'Link') {
                    viewable = viewable.replace('https://opensea.io/collection/','')
                }
                if (viewable.length>40) {
                    viewable = viewable.substring(0,40)+'...';
                }
                if (keyValue == 'Link') {                                                            
                    td.innerHTML = `slug: <a target="_blank" href="${rowData[keyValue]}">${viewable}</a>`;
                } else {                    
                    td.textContent = viewable;
                }
                tr.appendChild(td);    
            });
        });
        parentElement.appendChild(table);
    }

    function sortColumn(table, th) {
        const tableRows = Array.from(table.querySelectorAll('tbody tr'));
        const columnIndex = Array.from(th.parentNode.children).indexOf(th);
        const isAscending = th.dataset.order === 'asc';

        tableRows.sort(function (a, b) {
            const aValue = a.cells[columnIndex].textContent;
            const bValue = b.cells[columnIndex].textContent;

            if (!isNaN(aValue) && !isNaN(bValue)) {
                return isAscending ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue);
            } else {
                return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        tableRows.forEach(function (row) {
            table.querySelector('tbody').appendChild(row);
        });

        th.dataset.order = isAscending ? 'desc' : 'asc';
    }

    function filterTable(query, data) {
        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = '';

        if (query.trim() === '') {
            createSortableTable(tableContainer, data);
            return;
        }

        const filteredData = data.filter(row => {
            return Object.values(row).some(cellValue =>
                cellValue.toString().toLowerCase().includes(query)
            );
        });

        createSortableTable(tableContainer, filteredData);
    }

});