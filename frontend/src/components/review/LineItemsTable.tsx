import React from 'react';
import { useBill } from '../../context/BillContext';
import { ConfidenceBadge } from './ConfidenceBadge';
import { getCurrencySymbol } from '../../utils/currency';
import { Plus, Trash2, Utensils } from 'lucide-react';

export const LineItemsTable: React.FC = () => {
  const { billData, updateLineItem, deleteLineItem, addLineItem } = useBill();

  if (!billData) return null;

  const currencySymbol = getCurrencySymbol(billData.currency);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-indigo-400" />
            <span>Extracted Line Items</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {billData.items.length} {billData.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <button
          onClick={addLineItem}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
                <th className="py-3 px-3 sm:px-4 min-w-[180px]">Item Description</th>
                <th className="py-3 px-2 sm:px-3 w-20 text-center">Qty</th>
                <th className="py-3 px-2 sm:px-3 w-24 text-right">Unit Rate</th>
                <th className="py-3 px-3 sm:px-4 w-32 text-right">Total Price ({currencySymbol})</th>
                <th className="py-3 px-3 sm:px-4 w-28 text-center">Confidence</th>
                <th className="py-3 px-2 sm:px-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {billData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">No line items in bill.</p>
                    <button
                      onClick={addLineItem}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Click here to add an item
                    </button>
                  </td>
                </tr>
              ) : (
                billData.items.map((item, index) => {
                  const isLowConfidence = item.confidence < 0.5;

                  return (
                    <tr
                      key={item.id}
                      className={`group transition-colors ${
                        isLowConfidence
                          ? 'bg-rose-50/60 dark:bg-rose-950/10 hover:bg-rose-100/60 dark:hover:bg-rose-950/20'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 sm:px-4 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      {/* Name input */}
                      <td className="py-2 px-3 sm:px-4">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                          placeholder="Item name / description"
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </td>

                      {/* Quantity input */}
                      <td className="py-2 px-2 sm:px-3 text-center">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateLineItem(item.id, { quantity: isNaN(val) ? 0 : val });
                          }}
                          placeholder="1"
                          className="w-16 mx-auto text-center bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-lg px-1.5 py-1 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </td>

                      {/* Unit Price input */}
                      <td className="py-2 px-2 sm:px-3 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-slate-500 dark:text-slate-400 text-xs mr-0.5">{currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price === 0 ? '' : item.unit_price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateLineItem(item.id, { unit_price: isNaN(val) ? 0 : val });
                            }}
                            placeholder="0.00"
                            className="w-20 text-right bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-lg px-1.5 py-1 text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </td>

                      {/* Total Price input */}
                      <td className="py-2 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs mr-0.5">{currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.total_price === 0 ? '' : item.total_price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateLineItem(item.id, { total_price: isNaN(val) ? 0 : val });
                            }}
                            placeholder="0.00"
                            className="w-24 text-right bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </td>

                      {/* Confidence Badge */}
                      <td className="py-2 px-3 sm:px-4 text-center">
                        <ConfidenceBadge confidence={item.confidence} />
                      </td>

                      {/* Delete action */}
                      <td className="py-2 px-2 sm:px-3 text-center">
                        <button
                          onClick={() => deleteLineItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom bar with Add Item & Quick Help */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={addLineItem}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add another line item</span>
          </button>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 text-[11px]">
            * Unit rate auto-updates when total or quantity changes
          </span>
        </div>
      </div>
    </div>
  );
};
