import { state } from './state.js';
import { showToast } from './utils.js';

export function setupFormListeners() {
    // These might be called from within the form modal interactions
    // Since form elements are static (in partials), we can attach listeners if we want.
    // For now, we export the functions so main.js or agent.js can use them.
}

export function openLeadForm() {
    const modal = document.getElementById('leadFormModal');
    const currentLead = state.isFilterActive ? state.filteredData[state.currentIndex] : state.data[state.currentIndex];

    if (!currentLead) {
        showToast('No lead selected');
        return;
    }

    // Pre-fill fields
    const getVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    getVal('formFullName', currentLead.Name);
    getVal('formPhone', currentLead.Phone);
    getVal('formAddress', currentLead.Address);

    // Clear other fields
    getVal('formAgentCode', '');
    getVal('formConfBy', '');
    getVal('formMasterNotes', '');
    getVal('formCrmNotes', '');
    getVal('formVaTag', '');
    getVal('formApptMonth', '');
    getVal('formApptDay', '');
    getVal('formApptHour', '');

    // Reset Products
    const container = document.getElementById('formProductsContainer');
    if (container) {
        container.innerHTML = '';
        addProductRow(); // Add initial row
    }

    if (modal) {
        modal.style.display = 'flex';
        if (window.feather) feather.replace();
    }
}

export function addProductRow() {
    const container = document.getElementById('formProductsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'product-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginTop = '8px';

    let qtyOptions = '';
    for (let i = 1; i <= 15; i++) {
        qtyOptions += `<option value="${i}">${i}</option>`;
    }
    qtyOptions += `<option value="Custom">Custom</option>`;

    row.innerHTML = `
    <select class="form-input product-select" style="flex: 2;">
      <option value="Roof">Roof</option>
      <option value="Windows">Windows</option>
      <option value="Doors">Doors</option>
      <option value="Kitchen">Kitchen</option>
      <option value="Bathroom">Bathroom</option>
    </select>
    <div class="qty-wrapper" style="flex: 1; display: none;">
      <select class="form-input quantity-select" style="width: 100%;">
        ${qtyOptions}
      </select>
      <input type="text" class="form-input quantity-custom" style="display: none; width: 100%;" placeholder="#">
    </div>
    <button class="small-btn danger-btn remove-product-btn" style="width: auto; padding: 0 8px;"><i data-feather="trash-2"></i></button>
  `;

    const productSelect = row.querySelector('.product-select');
    const qtyWrapper = row.querySelector('.qty-wrapper');
    const qtySelect = row.querySelector('.quantity-select');
    const qtyCustom = row.querySelector('.quantity-custom');

    // Logic: Show/Hide Qty based on Product
    function updateQtyVisibility() {
        if (productSelect.value === 'Roof') {
            qtyWrapper.style.display = 'none';
            productSelect.style.flex = '3';
        } else {
            qtyWrapper.style.display = 'block';
            productSelect.style.flex = '2';
        }
    }

    // Logic: Handle Custom Qty
    qtySelect.addEventListener('change', () => {
        if (qtySelect.value === 'Custom') {
            qtySelect.style.display = 'none';
            qtyCustom.style.display = 'block';
            qtyCustom.focus();
        }
    });

    productSelect.addEventListener('change', updateQtyVisibility);

    // Add remove event
    row.querySelector('.remove-product-btn').addEventListener('click', () => {
        if (container.children.length > 1) {
            container.removeChild(row);
        } else {
            showToast('At least one product is required');
        }
    });

    container.appendChild(row);
    updateQtyVisibility();
    if (window.feather) feather.replace();
}

export function copyFormToClipboard() {
    const getVal = (id) => document.getElementById(id)?.value || '';

    const company = getVal('formCompany');
    const team = getVal('formTeam');
    const agentCode = getVal('formAgentCode');
    const fullName = getVal('formFullName');
    const phone = getVal('formPhone');
    const language = getVal('formLanguage');
    const maritalStatus = getVal('formMaritalStatus');
    const address = getVal('formAddress');

    // Products
    const productRows = document.querySelectorAll('.product-row');
    let products = [];
    productRows.forEach(row => {
        const prod = row.querySelector('.product-select').value;
        if (prod === 'Roof') {
            products.push(prod);
        } else {
            const qtySelect = row.querySelector('.quantity-select');
            const qtyCustom = row.querySelector('.quantity-custom');
            let qty = qtySelect.value;
            if (qty === 'Custom' || qtySelect.style.display === 'none') {
                qty = qtyCustom.value || '?';
            }
            products.push(`${prod} (${qty})`);
        }
    });
    const productStr = products.join(', ');

    const apptMonth = getVal('formApptMonth');
    const apptDay = getVal('formApptDay');
    const apptHour = getVal('formApptHour');
    const apptAmPm = getVal('formApptAmPm');

    const apptStr = (apptMonth && apptDay && apptHour) ? `${apptMonth}/${apptDay}@${apptHour}${apptAmPm}` : '';

    const confBy = getVal('formConfBy');
    const masterNotes = getVal('formMasterNotes');
    const crmNotes = getVal('formCrmNotes');
    const vaTag = getVal('formVaTag');
    const leadQuality = getVal('formLeadQuality');
    const source = getVal('formSource');
    const leadStatus = getVal('formLeadStatus');

    const text = `
Company: ${company}
Team: ${team}
Agent Code: ${agentCode}
Full Name: ${fullName}
Phone Number: ${phone}
Language: ${language}
Marital Status: ${maritalStatus}
Address: ${address}
Product: ${productStr}
Appt. Date & Time: ${apptStr}
Conf. by: ${confBy}
Master Notes: ${masterNotes}
CRM Notes: ${crmNotes}
VA Tag: ${vaTag}
Lead Quality: ${leadQuality}
Source: ${source}
Lead Status: ${leadStatus}
`.trim();

    navigator.clipboard.writeText(text).then(() => {
        showToast('Form data copied to clipboard', 'success');
    }).catch(err => {
        console.error('Copy error:', err);
        showToast('Failed to copy', 'error');
    });
}
