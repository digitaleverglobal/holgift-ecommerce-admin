import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { scratchCardService } from '../../services/scratchCardService';
import { codAmount } from '../../utils/codAmount';
import ScratchCardStickerSheet from './ScratchCardStickerSheet';
import { useStickerPrint } from './useStickerPrint';
import { cardPrizes } from './prizes';

const CHUNK = 500; // the API's "ids" filter takes up to this many

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Loads the cards in the order they were sent.
async function loadBatch(allIds, claimType) {
  const found = [];
  for (let start = 0; start < allIds.length; start += CHUNK) {
    const ids = allIds.slice(start, start + CHUNK);
    const res = await scratchCardService.getAll({ ids: ids.join(','), claimType, page: 1, limit: CHUNK });
    found.push(...(res.data || []));
  }
  const byId = new Map(found.map((row) => [row.Id, row]));
  return allIds.map((id) => byId.get(id)).filter(Boolean);
}

// The cards one bulk "Send to courier" just booked, with their consignment
// IDs, so their stickers can be printed right away.
export default function ScratchCardSentBatch({ batch, claimType, onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    loadBatch(batch.ids, claimType)
      .then((found) => {
        if (!alive) return;
        setRows(found);
        setSelectedIds(found.map((row) => row.Id));
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [batch, claimType, reloadKey]);

  function refresh() {
    setLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  }

  const markPrinted = useCallback((ids, stickerPrintedAt) => {
    setRows((prev) => prev.map((row) => (ids.includes(row.Id) ? { ...row, stickerPrintedAt } : row)));
  }, []);
  const { stickerCards, printStickers } = useStickerPrint(markPrinted);

  const printable = rows.filter((row) => row.courier && (row.consignmentId || row.trackingCode));
  const notPrinted = printable.filter((row) => !row.stickerPrintedAt);
  const selectedPrintable = printable.filter((row) => selectedIds.includes(row.Id));
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggle(id) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function print(cards) {
    if (!cards.length) return alert('Print করার মতো কোনো sticker নেই');
    printStickers(cards);
  }

  const buttonClass = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold disabled:opacity-50';

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
            <ArrowLeft size={13} /> Scratch Card list এ ফিরে যান
          </button>
          <h1 className="text-lg font-bold text-gray-800">{batch.courier} এ পাঠানো card</h1>
          <p className="mt-1 text-xs text-gray-500">
            {formatDate(batch.sentAt)} এ {batch.ids.length} টি card পাঠানো হয়েছে · Printed {printable.length - notPrinted.length} / {printable.length}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={refresh} disabled={loading}
            className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button type="button" onClick={() => print(selectedPrintable)} disabled={loading || !selectedPrintable.length}
            className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            <Printer size={13} /> Print Selected ({selectedPrintable.length})
          </button>
          <button type="button" onClick={() => print(notPrinted)} disabled={loading || !notPrinted.length}
            className={`${buttonClass} bg-gray-900 text-white hover:bg-black`}>
            <Printer size={13} /> Print Not Printed ({notPrinted.length})
          </button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} disabled={!rows.length} aria-label="Select all"
                  onChange={() => setSelectedIds(allSelected ? [] : rows.map((row) => row.Id))} />
              </th>
              <th className="px-4 py-3">SL</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Consignment ID</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Prize</th>
              <th className="px-4 py-3">COD</th>
              <th className="px-4 py-3">Sticker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
            ) : !rows.length ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">কোনো card পাওয়া যায়নি</td></tr>
            ) : rows.map((row, index) => (
              <tr key={row.Id} className={selectedIds.includes(row.Id) ? 'bg-indigo-50/40' : ''}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.includes(row.Id)} onChange={() => toggle(row.Id)} aria-label={`Select ${row.referenceCode}`} />
                </td>
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 font-mono font-semibold text-gray-800 whitespace-nowrap">{row.referenceCode}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.courier ? (
                    <>
                      <div className="font-mono font-semibold text-gray-800">{row.consignmentId || '—'}</div>
                      <div className="mt-1 text-[11px] text-gray-500">
                        {row.courier}
                        {row.trackingCode && row.trackingCode !== row.consignmentId && (
                          <> · Tracking <span className="font-mono">{row.trackingCode}</span></>
                        )}
                      </div>
                    </>
                  ) : <span className="text-red-600 text-xs font-semibold">Unlinked</span>}
                </td>
                <td className="px-4 py-3 text-gray-800">{row.fullName}</td>
                <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{row.phone}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">{row.address}</td>
                <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{cardPrizes(row).join(', ')}</td>
                <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.courierCodAmount != null ? codAmount(row.courierCodAmount) : '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.stickerPrintedAt ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <Printer size={11} /> Printed · {formatDate(row.stickerPrintedAt)}
                    </span>
                  ) : <span className="text-[11px] font-semibold text-amber-600">Not printed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stickerCards.length > 0 && <ScratchCardStickerSheet cards={stickerCards} />}
    </div>
  );
}
