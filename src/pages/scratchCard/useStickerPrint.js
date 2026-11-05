import { useState, useEffect, useCallback } from 'react';
import { scratchCardService } from '../../services/scratchCardService';

// Renders the sticker sheet, opens the print dialog, and records the cards as
// printed. They are marked when the dialog opens: the browser does not say
// whether the stickers were printed or the dialog cancelled.
export function useStickerPrint(onMarked) {
  const [stickerCards, setStickerCards] = useState([]);

  // Print once the sticker sheet has rendered, and drop it afterwards.
  useEffect(() => {
    if (!stickerCards.length) return undefined;
    const handleAfterPrint = () => setStickerCards([]);
    window.addEventListener('afterprint', handleAfterPrint);
    const timer = window.setTimeout(() => window.print(), 100);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [stickerCards]);

  const printStickers = useCallback((cards) => {
    setStickerCards(cards);
    const ids = cards.map((card) => card.Id);
    scratchCardService.markStickersPrinted(ids)
      .then((res) => onMarked(ids, res.data?.stickerPrintedAt || new Date().toISOString()))
      .catch((err) => alert(`Sticker print হয়েছে, কিন্তু "Printed" mark save হয়নি: ${err.message}`));
  }, [onMarked]);

  return { stickerCards, printStickers };
}
