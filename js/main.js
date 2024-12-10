const calendar = document.querySelector('#calendar tbody');
const alertsContainer = document.getElementById('alerts-container');
const saveButton = document.getElementById('save-button');
const form = document.getElementById('payment-form');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthText = document.getElementById('current-month');
let selectedCell = null;

let currentDate = new Date(); // Fecha actual para controlar el mes mostrado

// Generar el calendario dinámicamente
function generateCalendar(date) {
    calendar.innerHTML = '';
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = firstDay.getDay();

    // Actualizar el texto del mes actual
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    currentMonthText.textContent = `Mes Actual: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

    let day = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < startDay || day > lastDay.getDate()) {
                cell.textContent = '';
            } else {
                cell.textContent = day;
                cell.dataset.date = `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
                cell.classList.add('calendar-cell'); // Clase para estilo
                cell.addEventListener('mouseover', () => hoverDate(cell)); // Resaltar al pasar el cursor
                cell.addEventListener('mouseout', () => unhoverDate(cell)); // Quitar resaltado al salir el cursor
                cell.addEventListener('click', () => selectDate(cell)); // Seleccionar fecha al hacer clic
                day++;
            }
            row.appendChild(cell);
        }
        calendar.appendChild(row);
    }
}

// Resaltar fecha al pasar el cursor
function hoverDate(cell) {
    if (!cell.classList.contains('selected')) {
        cell.classList.add('hovered');
    }
}

// Quitar resaltado al salir el cursor
function unhoverDate(cell) {
    if (!cell.classList.contains('selected')) {
        cell.classList.remove('hovered');
    }
}

// Resaltar la fecha seleccionada y mostrar el mensaje
function selectDate(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    selectedCell.classList.add('selected');
    selectedCell.classList.remove('hovered'); // Quitar el hover si está seleccionada

    const selectedDate = cell.dataset.date;
    alert(`Seleccionaste la fecha: ${selectedDate}`);
    form.dataset.selectedDate = selectedDate;
}

// Cambiar el mes actual
function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    generateCalendar(currentDate);
}

// Guardar información de pagos
function savePayment() {
    const date = form.dataset.selectedDate;
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const company = document.getElementById('company').value;
    const description = document.getElementById('description').value;
    const installment = document.getElementById('installment').value;

    if (!date) {
        alert('Selecciona una fecha.');
        return;
    }

    const payment = {
        date,
        amount,
        currency,
        company,
        description,
        installment
    };

    localStorage.setItem(date, JSON.stringify(payment));
    alert(`Pago guardado para la fecha: ${date}. Empresa: ${company}.`);
    updateAlerts();
}

// Mostrar alertas
function updateAlerts() {
    alertsContainer.innerHTML = '';
    const today = new Date();

    Object.keys(localStorage).forEach(date => {
        const payment = JSON.parse(localStorage.getItem(date));
        const dueDate = new Date(date);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)); // Diferencia en días

        let alertClass = '';
        let message = '';

        // Determinar el color y mensaje de la alerta según los días restantes
        if (diffDays >= 0 && diffDays <= 3) {
            alertClass = 'alert-danger'; // Rojo
            message = 'ALERTA';
        } else if (diffDays > 3 && diffDays <= 7) {
            alertClass = 'alert-warning'; // Amarillo
            message = 'ACORDATE DE ABONAR';
        } else if (diffDays > 7 && diffDays <= 15) {
            alertClass = 'alert-success'; // Verde
            message = 'QUEDATE TRANQUILO TODAVÍA FALTA';
        } else if (diffDays > 15) {
            alertClass = 'alert-info'; // Azul
            message = 'TENÉS MUCHO TIEMPO PARA PAGAR';
        } else {
            // No mostrar alertas si está vencido (días negativos)
            return;
        }

        const alert = document.createElement('div');
        alert.className = `alert ${alertClass}`;
        alert.innerHTML = `
            ${message}: ${payment.company} - ${payment.description}, ${payment.amount} ${payment.currency}, Cuota ${payment.installment}.
            Faltan ${diffDays} días para el vencimiento.
            <button class="btn-close" data-date="${date}" aria-label="Cerrar"></button>
        `;
        alertsContainer.appendChild(alert);
    });

    document.querySelectorAll('.btn-close').forEach(button => {
        button.addEventListener('click', function () {
            const date = this.dataset.date;
            localStorage.removeItem(date);
            updateAlerts();
        });
    });
}

// Inicializar
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
saveButton.addEventListener('click', savePayment);

generateCalendar(currentDate);
updateAlerts();
