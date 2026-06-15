import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, Trash2, AlertTriangle, CheckCircle2, Mail } from 'lucide-react';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';

interface VerifiedItem {
  name: string;
  expectedQuantity: number;
  receivedQuantity: number;
  badQuantity: number;
  unitPrice: number;
  unit: string;
}

interface ExtraItem {
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface DeliveryVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

export function DeliveryVerificationDialog({ open, onClose, order }: DeliveryVerificationDialogProps) {
  const [verifiedItems, setVerifiedItems] = useState<VerifiedItem[]>(
    order.items.map(item => ({
      name: item.name,
      expectedQuantity: item.quantity,
      receivedQuantity: item.quantity,
      badQuantity: 0,
      unitPrice: item.unitPrice,
      unit: item.unit || 'units',
    }))
  );

  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [newExtraItem, setNewExtraItem] = useState({ name: '', quantity: 0, unitPrice: 0, unit: 'units' });
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const updateReceivedQuantity = (index: number, delta: number) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      updated[index].receivedQuantity = Math.max(0, updated[index].receivedQuantity + delta);
      return updated;
    });
  };

  const setReceivedQuantity = (index: number, value: number) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      updated[index].receivedQuantity = Math.max(0, value);
      return updated;
    });
  };

  const updateBadQuantity = (index: number, delta: number) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      const maxBad = updated[index].receivedQuantity;
      updated[index].badQuantity = Math.max(0, Math.min(maxBad, updated[index].badQuantity + delta));
      return updated;
    });
  };

  const setBadQuantity = (index: number, value: number) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      const maxBad = updated[index].receivedQuantity;
      updated[index].badQuantity = Math.max(0, Math.min(maxBad, value));
      return updated;
    });
  };

  const addExtraItem = () => {
    if (newExtraItem.name && newExtraItem.quantity > 0) {
      setExtraItems(prev => [...prev, newExtraItem]);
      setNewExtraItem({ name: '', quantity: 0, unitPrice: 0, unit: 'units' });
    }
  };

  const removeExtraItem = (index: number) => {
    setExtraItems(prev => prev.filter((_, i) => i !== index));
  };

  const hasIssues = () => {
    const hasQuantityIssues = verifiedItems.some(
      item => item.receivedQuantity !== item.expectedQuantity || item.badQuantity > 0
    );
    const hasExtraItems = extraItems.length > 0;
    return hasQuantityIssues || hasExtraItems;
  };

  const generateEmailContent = () => {
    const issues: string[] = [];

    // Missing items
    const missingItems = verifiedItems.filter(item => item.receivedQuantity < item.expectedQuantity);
    if (missingItems.length > 0) {
      issues.push('**Missing Items:**');
      missingItems.forEach(item => {
        const missing = item.expectedQuantity - item.receivedQuantity;
        issues.push(`- ${item.name}: ${missing} ${item.unit} missing (Expected: ${item.expectedQuantity} ${item.unit}, Received: ${item.receivedQuantity} ${item.unit})`);
      });
      issues.push('');
    }

    // Bad quality items
    const badItems = verifiedItems.filter(item => item.badQuantity > 0);
    if (badItems.length > 0) {
      issues.push('**Quality Issues:**');
      badItems.forEach(item => {
        issues.push(`- ${item.name}: ${item.badQuantity} ${item.unit} of poor quality/rotten`);
      });
      issues.push('');
    }

    // Extra items
    if (extraItems.length > 0) {
      issues.push('**Extra Items (Not Ordered):**');
      extraItems.forEach(item => {
        issues.push(`- ${item.name}: ${item.quantity} ${item.unit}`);
      });
      issues.push('');
    }

    // Over-delivered items
    const overDelivered = verifiedItems.filter(item => item.receivedQuantity > item.expectedQuantity);
    if (overDelivered.length > 0) {
      issues.push('**Over-Delivered Items:**');
      overDelivered.forEach(item => {
        const extra = item.receivedQuantity - item.expectedQuantity;
        issues.push(`- ${item.name}: ${extra} extra ${item.unit} (Expected: ${item.expectedQuantity} ${item.unit}, Received: ${item.receivedQuantity} ${item.unit})`);
      });
    }

    return `Dear ${order.supplier},

I am writing to report discrepancies with Order ${order.id} delivered on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

${issues.join('\n')}

Please review these issues and advise on the next steps for resolution.

Best regards,
[Your Name]
[Restaurant Name]`;
  };

  return (
    <>
      <Dialog open={open && !showEmailPreview} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Delivery - Order {order.id}</DialogTitle>
            <DialogDescription>
              Supplier: {order.supplier} • Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Ordered Items Verification */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-text-light dark:text-text-dark">Ordered Items</h3>
              <div className="space-y-3">
                {verifiedItems.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border",
                      item.receivedQuantity !== item.expectedQuantity || item.badQuantity > 0
                        ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-text-light dark:text-text-dark">{item.name}</p>
                        <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                          Expected: {item.expectedQuantity} {item.unit} @ ${item.unitPrice}/{item.unit}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Received Quantity */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-light dark:text-muted-dark w-16">Received:</span>
                          <button
                            onClick={() => updateReceivedQuantity(index, -1)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={item.receivedQuantity}
                            onChange={(e) => setReceivedQuantity(index, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center text-sm font-medium border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                            min="0"
                          />
                          <button
                            onClick={() => updateReceivedQuantity(index, 1)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="text-xs text-muted-light dark:text-muted-dark">{item.unit}</span>
                        </div>

                        {/* Bad Quality */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-light dark:text-muted-dark w-16">Bad/Rotten:</span>
                          <button
                            onClick={() => updateBadQuantity(index, -1)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={item.badQuantity}
                            onChange={(e) => setBadQuantity(index, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center text-sm font-medium text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                            min="0"
                            max={item.receivedQuantity}
                          />
                          <button
                            onClick={() => updateBadQuantity(index, 1)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="text-xs text-muted-light dark:text-muted-dark">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Items */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-text-light dark:text-text-dark">Extra Items (Not Ordered)</h3>

              {extraItems.length > 0 && (
                <div className="space-y-2 mb-3">
                  {extraItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-light dark:text-muted-dark">
                          {item.quantity} {item.unit} @ ${item.unitPrice}/{item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExtraItem(index)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newExtraItem.name}
                  onChange={(e) => setNewExtraItem(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newExtraItem.quantity || ''}
                  onChange={(e) => setNewExtraItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newExtraItem.unit}
                  onChange={(e) => setNewExtraItem(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newExtraItem.unitPrice || ''}
                  onChange={(e) => setNewExtraItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <button
                  onClick={addExtraItem}
                  className="px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              {hasIssues() ? (
                <button
                  onClick={() => setShowEmailPreview(true)}
                  className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report Issues
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Verified
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreview} onOpenChange={(isOpen) => !isOpen && setShowEmailPreview(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preview - Delivery Issues Report
            </DialogTitle>
            <DialogDescription>
              Review the email content before copying and sending to the supplier
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <pre className="whitespace-pre-wrap text-sm text-text-light dark:text-text-dark font-sans">
                {generateEmailContent()}
              </pre>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Back to Edit
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateEmailContent());
                  setShowEmailPreview(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Copy Email & Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
