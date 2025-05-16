document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".modal");
  const newInvoiceBtn = document.querySelector(".btn-primary");
  const dropdown = document.querySelector(".dropdown");
  const filter = document.querySelector(".filter");
  const discard = document.querySelector(".btn-discard");
  const addNewItemBtn = document.querySelector(".btn-secondary");
  const newItem = document.querySelector(".new-item");
  const invoiceForm = document.querySelector("#invoice_form");
  const submitBtnSend = document.querySelector(".btn-send");
  const submitBtnDraft = document.querySelector(".btn-draft");
  const invoiceContainer = document.querySelector(".invoice-container");
  const addItemBtn = document.getElementById("add-item-btn");
  const discardBtn = document.getElementById("discard-btn");
  const itemsContainer = document.querySelector(".items-container");
  const sunIcon = document.querySelector(".sun-icon");

  let isDropdownOpen = false;
  let submitStatus = "Paid";
  let newInvoiceArrays =
    JSON.parse(localStorage.getItem("newInvoiceArrays")) || [];

  function generateInvoice(invoices) {
    invoiceContainer.innerHTML = invoices
      .map((invoice) => {
        return `
          <div class="box">
            <div class="box-left">
              <h3>#INV00-${invoice.invoiceId}</h3>
              <p>Due: ${invoice.invoiceDate}</p>
              <p>${invoice.clientName}</p>
            </div>
            <div class="box-right">
              <h3>£${invoice.totalPriceQuantity.toFixed(2)}</h3>
              <div class="status">
                <h4 class="status-${invoice.status.toLowerCase()}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8" />
                  </svg>
                  ${invoice.status}
                </h4>
              </div>
              <button class="delete-invoice-btn" data-id="${invoice.invoiceId}">🗑</button>
            </div>
          </div>
        `;
      })
      .join("");

    // Add event listeners to the newly generated delete buttons
    const deleteButtons = document.querySelectorAll(".delete-invoice-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => deleteInvoice(button));
    });
  }

  function deleteInvoice(button) {
    const invoiceIdToDelete = parseInt(button.getAttribute("data-id"));

    // Remove from array
    const invoiceIndex = newInvoiceArrays.findIndex(
      (invoice) => invoice.invoiceId === invoiceIdToDelete
    );
    if (invoiceIndex !== -1) {
      newInvoiceArrays.splice(invoiceIndex, 1);
      localStorage.setItem("newInvoiceArrays", JSON.stringify(newInvoiceArrays));
    }

    // Remove from DOM
    const itemRow = button.closest(".box"); // Assuming .box wraps the invoice row
    if (itemRow) {
      itemRow.remove();
    }

    // Regenerate invoices to update the displayed list
    generateInvoice(newInvoiceArrays);
  }

  if (newItem) newItem.style.display = "none";
  if (modal) modal.style.display = "none";
  if (dropdown) dropdown.style.display = "none";
  if (sunIcon) sunIcon.style.display = "none";

  newInvoiceBtn?.addEventListener("click", () => {
    if (modal) modal.style.display = "block";
  });
  discard?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  discardBtn?.addEventListener("click", (e) => {
    e.preventDefault(); // prevent form reset default behavior
    if (modal) modal.style.display = "none";
    invoiceForm?.reset(); // clear form fields
    itemsContainer.innerHTML = ""; // remove added items
  });

  filter?.addEventListener("mouseenter", () => {
    dropdown.style.display = "block";
    isDropdownOpen = true;
  });

  filter?.addEventListener("click", (event) => {
    event.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    dropdown.style.display = isDropdownOpen ? "block" : "none";
  });

  document.addEventListener("click", (event) => {
    if (
      isDropdownOpen &&
      !filter.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      dropdown.style.display = "none";
      isDropdownOpen = false;
    }
  });

  addNewItemBtn?.addEventListener("click", (e) => {
    e.preventDefault(); // prevents accidental form submission

    const newItemHTML = `
      <div class="new-item-details">
        <div class="client-details">
          <label class="label-secondary">Item Name</label>
          <input class="input-four item-name" type="text" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Qty</label>
          <input class="input-five item-qty" type="number" value="0" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Price</label>
          <input class="input-five item-price" type="number" value="0" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Total</label>
          <input class="input-five item-total" type="text" value="0.00" readonly />
        </div>
        <div>
          <button class="delete-item-btn">🗑</button>
        </div>
      </div>
    `;

    const temp = document.createElement("div");
    temp.innerHTML = newItemHTML;
    const newItemElement = temp.firstElementChild;

    const qtyInput = newItemElement.querySelector(".item-qty");
    const priceInput = newItemElement.querySelector(".item-price");
    const totalInput = newItemElement.querySelector(".item-total");

    const updateTotal = () => {
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      totalInput.value = (qty * price).toFixed(2);
    };

    qtyInput.addEventListener("input", updateTotal);
    priceInput.addEventListener("input", updateTotal);

    newItemElement
      .querySelector(".delete-item-btn")
      .addEventListener("click", () => {
        newItemElement.remove();
      });

    itemsContainer.appendChild(newItemElement);
  });

  submitBtnSend?.addEventListener("click", () => {
    submitStatus = "Paid";
    invoiceForm.requestSubmit();
  });

  submitBtnDraft?.addEventListener("click", () => {
    submitStatus = "Draft";
    invoiceForm.requestSubmit();
  });

  if (newInvoiceArrays.length > 0) {
    generateInvoice(newInvoiceArrays);
  }

  invoiceForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const invoiceId = newInvoiceArrays.length > 0 ? newInvoiceArrays[newInvoiceArrays.length - 1].invoiceId + 1 : 1;

    const invoice = {
      invoiceId,
      streetAddress: document.querySelector("#primary-street-address").value,
      city: document.querySelector("#primary-city").value,
      postCode: document.querySelector("#primary-post-code").value,
      country: document.querySelector("#primary-country").value,
      clientName: document.querySelector("#client-name").value,
      clientEmail: document.querySelector("#client-email").value,
      clientStreetAddress: document.querySelector("#secondary-street-address")
        .value,
      clientCity: document.querySelector("#secondary-city").value,
      clientPostCode: document.querySelector("#secondary-post-code").value,
      clientCountry: document.querySelector("#secondary-country").value,
      invoiceDate: document.querySelector("#invoice-date").value,
      paymentTerms: document.querySelector("#Payment-terms").value,
      projectDescription: document.querySelector("#project-description").value,
      items: [],
      totalPriceQuantity: 0,
      status: submitStatus,
    };
    const itemBlocks = document.querySelectorAll(".new-item-details");
    itemBlocks.forEach((block) => {
      const itemNameInput = block.querySelector(".item-name");
      const itemQtyInput = block.querySelector(".item-qty");
      const itemPriceInput = block.querySelector(".item-price");

      if (itemNameInput && itemQtyInput && itemPriceInput) {
        const itemName = itemNameInput.value;
        const itemQty = parseFloat(itemQtyInput.value) || 0;
        const itemPrice = parseFloat(itemPriceInput.value) || 0;
        const itemTotal = itemQty * itemPrice;

        invoice.items.push({
          itemName,
          itemQty,
          itemPrice,
          itemTotal,
        });

        invoice.totalPriceQuantity += itemTotal;
      }
    });

    newInvoiceArrays.push(invoice);
    localStorage.setItem("newInvoiceArrays", JSON.stringify(newInvoiceArrays));

    generateInvoice(newInvoiceArrays);

    if (modal) modal.style.display = "none";
    newItem.style.display = "none";
    itemsContainer.innerHTML = "";
    invoiceForm.reset(); // Clear the form after submission
  });
});