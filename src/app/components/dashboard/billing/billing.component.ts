import { Component, computed, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BillingInvoice,
  BillingLineItem,
  CustomerProfile,
  InvoiceFilters,
  InvoiceStatus,
  MilkEntry
} from '../../../models/dairy.models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent {
  @Input() milkEntries: MilkEntry[] = [];
  @Input() customers: CustomerProfile[] = [];
  @Input() invoices: BillingInvoice[] = [];
  
  @Output() invoiceCreated = new EventEmitter<BillingInvoice>();
  @Output() invoiceStatusChanged = new EventEmitter<{ id: string; status: InvoiceStatus }>();
  @Output() invoiceDeleted = new EventEmitter<string>();

  // View state
  activeView = signal<'list' | 'create' | 'detail'>('list');
  selectedInvoiceId = signal<string | null>(null);

  // Filter state
  filters = signal<InvoiceFilters>({
    farmerId: '',
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    status: 'all'
  });

  // Create invoice form
  createForm = signal<InvoiceFilters>({
    farmerId: '',
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    status: 'draft'
  });

  // Computed filtered invoices
  filteredInvoices = computed(() => {
    const filter = this.filters();
    let result = [...this.invoices];

    if (filter.farmerId) {
      result = result.filter(inv => inv.farmerId === filter.farmerId);
    }

    if (filter.periodStart) {
      result = result.filter(inv => inv.periodStart >= filter.periodStart);
    }

    if (filter.periodEnd) {
      result = result.filter(inv => inv.periodEnd <= filter.periodEnd);
    }

    if (filter.status !== 'all') {
      result = result.filter(inv => inv.status === filter.status);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Computed available milk entries for selected farmer
  availableMilkEntries = computed(() => {
    const form = this.createForm();
    if (!form.farmerId || !form.periodStart || !form.periodEnd) {
      return [];
    }

    return this.milkEntries.filter(entry => {
      const entryDate = entry.date;
      return entry.farmerId === form.farmerId &&
             entryDate >= form.periodStart &&
             entryDate <= form.periodEnd;
    }).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.session === 'morning' ? -1 : 1;
    });
  });

  // Computed preview totals
  previewTotals = computed(() => {
    const entries = this.availableMilkEntries();
    const totalLiters = entries.reduce((sum, e) => sum + e.liters, 0);
    const grossAmount = entries.reduce((sum, e) => sum + e.totalAmount, 0);
    return { totalLiters, grossAmount, entryCount: entries.length };
  });

  // Get selected invoice
  selectedInvoice = computed(() => {
    const id = this.selectedInvoiceId();
    if (!id) return null;
    return this.invoices.find(inv => inv.id === id) || null;
  });

  // Get customer name by ID
  getCustomerName(farmerId: string): string {
    const customer = this.customers.find(c => c.farmerId === farmerId);
    return customer ? customer.farmerName : farmerId;
  }

  // Get customer by ID
  getCustomer(farmerId: string): CustomerProfile | undefined {
    return this.customers.find(c => c.farmerId === farmerId);
  }

  // View navigation
  showListView() {
    this.activeView.set('list');
    this.selectedInvoiceId.set(null);
  }

  showCreateView() {
    this.activeView.set('create');
    this.createForm.set({
      farmerId: '',
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
      status: 'draft'
    });
  }

  showDetailView(invoiceId: string) {
    this.selectedInvoiceId.set(invoiceId);
    this.activeView.set('detail');
  }

  // Filter updates
  updateFilter<K extends keyof InvoiceFilters>(key: K, value: InvoiceFilters[K]) {
    const current = this.filters();
    this.filters.set({ ...current, [key]: value });
  }

  updateCreateForm<K extends keyof InvoiceFilters>(key: K, value: InvoiceFilters[K]) {
    const current = this.createForm();
    this.createForm.set({ ...current, [key]: value });
  }

  // Create invoice
  createInvoice() {
    const form = this.createForm();
    const entries = this.availableMilkEntries();

    if (!form.farmerId) {
      alert('Please select a farmer');
      return;
    }

    if (entries.length === 0) {
      alert('No milk entries found for the selected farmer and date range');
      return;
    }

    const customer = this.getCustomer(form.farmerId);
    const totals = this.previewTotals();

    // Group entries by date and session for line items
    const lineItemsMap = new Map<string, BillingLineItem>();
    
    entries.forEach(entry => {
      const key = `${entry.date}_${entry.session}`;
      if (lineItemsMap.has(key)) {
        const existing = lineItemsMap.get(key)!;
        existing.liters += entry.liters;
        existing.amount += entry.totalAmount;
        // Use weighted average for rate
        existing.rate = existing.amount / existing.liters;
      } else {
        lineItemsMap.set(key, {
          date: entry.date,
          session: entry.session,
          liters: entry.liters,
          rate: entry.rate,
          amount: entry.totalAmount
        });
      }
    });

    const lineItems = Array.from(lineItemsMap.values()).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.session === 'morning' ? -1 : 1;
    });

    const invoice: BillingInvoice = {
      id: `INV_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      farmerId: form.farmerId,
      farmerName: customer?.farmerName || form.farmerId,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      totalLiters: totals.totalLiters,
      grossAmount: totals.grossAmount,
      status: form.status as InvoiceStatus,
      createdAt: new Date().toISOString(),
      lineItems: lineItems
    };

    this.invoiceCreated.emit(invoice);
    this.showListView();
  }

  // Update invoice status
  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    this.invoiceStatusChanged.emit({ id: invoiceId, status });
  }

  // Delete invoice
  deleteInvoice(invoiceId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this invoice?');
    if (confirmed) {
      this.invoiceDeleted.emit(invoiceId);
      if (this.selectedInvoiceId() === invoiceId) {
        this.showListView();
      }
    }
  }

  // Print invoice
  printInvoice(invoice: BillingInvoice) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const customer = this.getCustomer(invoice.farmerId);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #333; }
            .invoice-info { display: flex; justify-content: space-between; margin: 30px 0; }
            .info-section { flex: 1; }
            .info-section h3 { margin-top: 0; color: #555; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 1.1em; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
            .status.draft { background: #e2e8f0; color: #4a5568; }
            .status.issued { background: #bee3f8; color: #2c5282; }
            .status.paid { background: #c6f6d5; color: #22543d; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DAIRY MANAGEMENT SYSTEM</h1>
            <h2>INVOICE</h2>
          </div>
          <div class="invoice-info">
            <div class="info-section">
              <h3>Bill To:</h3>
              <p><strong>${invoice.farmerName}</strong><br>
              Farmer ID: ${invoice.farmerId}<br>
              ${customer?.address ? `Address: ${customer.address}<br>` : ''}
              ${customer?.mobileNumber ? `Mobile: ${customer.mobileNumber}` : ''}</p>
            </div>
            <div class="info-section" style="text-align: right;">
              <h3>Invoice Details:</h3>
              <p>Invoice #: ${invoice.id}<br>
              Period: ${new Date(invoice.periodStart).toLocaleDateString()} - ${new Date(invoice.periodEnd).toLocaleDateString()}<br>
              Date: ${new Date(invoice.createdAt).toLocaleDateString()}<br>
              Status: <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Session</th>
                <th>Liters</th>
                <th>Rate (₹/L)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${new Date(item.date).toLocaleDateString()}</td>
                  <td>${item.session === 'morning' ? 'Morning' : 'Evening'}</td>
                  <td>${item.liters.toFixed(2)}</td>
                  <td>${item.rate.toFixed(2)}</td>
                  <td>${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>${invoice.totalLiters.toFixed(2)} L</strong></td>
                <td></td>
                <td><strong>₹ ${invoice.grossAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Get status badge class
  getStatusClass(status: InvoiceStatus): string {
    return `status-badge ${status}`;
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `₹ ${amount.toFixed(2)}`;
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
