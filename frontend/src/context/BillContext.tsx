import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BillData, LineItem, ExtractionStatus, Participant, ItemAssignments } from '../types/bill';
import { extractBillFromImage, checkBackendHealth } from '../services/api';
import { calculateItemsSum, roundToTwo } from '../utils/math';
import { SAMPLE_RECEIPTS } from '../services/sampleData';

interface BillContextType {
  currentStep: 1 | 2 | 3 | 4 | 5;
  uploadedFile: File | null;
  receiptImageUrl: string | null;
  receiptImageName: string;
  billData: BillData | null;
  rawBillData: BillData | null;
  status: ExtractionStatus;
  errorMessage: string | null;
  isBackendOnline: boolean | null;
  configuredProvider: string;
  hasUnsavedChanges: boolean;

  // Phase 3 State
  participants: Participant[];
  assignments: ItemAssignments;
  unassignedCount: number;
  isAllItemsAssigned: boolean;

  // Actions
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  selectFile: (file: File) => void;
  clearFile: () => void;
  loadSampleReceipt: (sampleId: string) => Promise<void>;
  extractBill: () => Promise<void>;
  retryExtraction: () => Promise<void>;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  addLineItem: () => void;
  deleteLineItem: (id: string) => void;
  updateSummary: (updates: Partial<Omit<BillData, 'items'>>) => void;
  syncSubtotalFromItems: () => void;
  autoFixTotals: () => void;
  resetToOriginalExtraction: () => void;
  confirmAndContinue: () => void;
  startNewBill: () => void;

  // Phase 3 Actions
  addParticipant: (name: string) => Participant | null;
  removeParticipant: (participantId: string) => void;
  toggleItemAssignment: (itemId: string, participantId: string) => void;
  assignEveryoneToItem: (itemId: string) => void;
  clearItemAssignments: (itemId: string) => void;
  assignAllItemsToEveryone: () => void;
  resetAssignments: () => void;
  goToCalculation: () => void;
  goToResults: () => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'digivalet_bill_state';

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [receiptImageName, setReceiptImageName] = useState<string>('');
  const [billData, setBillData] = useState<BillData | null>(null);
  const [rawBillData, setRawBillData] = useState<BillData | null>(null);
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [configuredProvider, setConfiguredProvider] = useState<string>('groq');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Phase 3 state: participants and item assignments
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignments>({});

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((health) => {
      setIsBackendOnline(health.status === 'healthy' || health.status === 'online');
      if (health.provider) setConfiguredProvider(health.provider);
    });
  }, []);

  // Hydrate initial state from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.billData) {
          setBillData(parsed.billData);
          setRawBillData(parsed.billData);
          if (parsed.receiptImageName) setReceiptImageName(parsed.receiptImageName);
          if (parsed.receiptImageUrl) setReceiptImageUrl(parsed.receiptImageUrl);
          if (parsed.participants && Array.isArray(parsed.participants)) {
            setParticipants(parsed.participants);
          }
          if (parsed.assignments && typeof parsed.assignments === 'object') {
            setAssignments(parsed.assignments);
          }
          if (parsed.currentStep && [1, 2, 3, 4, 5].includes(parsed.currentStep)) {
            setCurrentStep(parsed.currentStep);
          }
          setStatus('success');
        }
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage', e);
    }
  }, []);

  // Save reviewed state & assignments to localStorage when changed
  useEffect(() => {
    if (billData) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            currentStep,
            receiptImageName,
            receiptImageUrl: receiptImageUrl?.startsWith('blob:') ? null : receiptImageUrl,
            billData,
            participants,
            assignments,
          })
        );
      } catch (e) {
        console.warn('Could not save bill to localStorage', e);
      }
    }
  }, [billData, currentStep, receiptImageName, receiptImageUrl, participants, assignments]);

  // Derived calculations for Phase 3 validation
  const unassignedCount = React.useMemo(() => {
    if (!billData || billData.items.length === 0) return 0;
    return billData.items.filter((item) => {
      const itemPeople = assignments[item.id];
      return !itemPeople || itemPeople.length === 0;
    }).length;
  }, [billData, assignments]);

  const isAllItemsAssigned = React.useMemo(() => {
    if (!billData || billData.items.length === 0) return false;
    if (participants.length === 0) return false;
    return unassignedCount === 0;
  }, [billData, participants, unassignedCount]);

  const selectFile = (file: File) => {
    setUploadedFile(file);
    setReceiptImageName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setReceiptImageUrl(objectUrl);
    setStatus('idle');
    setErrorMessage(null);
  };

  const clearFile = () => {
    if (receiptImageUrl && receiptImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(receiptImageUrl);
    }
    setUploadedFile(null);
    setReceiptImageUrl(null);
    setReceiptImageName('');
    setStatus('idle');
    setErrorMessage(null);
  };

  const loadSampleReceipt = async (sampleId: string) => {
    const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
    if (!sample) return;

    setUploadedFile(null);
    setReceiptImageUrl(sample.imageUrl);
    setReceiptImageName(sample.filename);
    setStatus('processing');
    setErrorMessage(null);

    // Fetch sample image file from public URL to send to real backend if desired
    try {
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const sampleFile = new File([blob], sample.filename, { type: blob.type || 'image/png' });
      setUploadedFile(sampleFile);

      // Perform live extraction if backend online, otherwise use rich sample payload
      try {
        const extracted = await extractBillFromImage(sampleFile);
        setBillData(extracted);
        setRawBillData(JSON.parse(JSON.stringify(extracted)));
        setStatus('success');
        setCurrentStep(2);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.log('Backend not responding, using pre-calculated sample data', err);
        setBillData(sample.data);
        setRawBillData(JSON.parse(JSON.stringify(sample.data)));
        setStatus('success');
        setCurrentStep(2);
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      setBillData(sample.data);
      setRawBillData(JSON.parse(JSON.stringify(sample.data)));
      setStatus('success');
      setCurrentStep(2);
      setHasUnsavedChanges(false);
    }
  };

  const extractBill = async () => {
    if (!uploadedFile) {
      setErrorMessage('Please select or drop a receipt image first.');
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const result = await extractBillFromImage(uploadedFile);
      setBillData(result);
      setRawBillData(JSON.parse(JSON.stringify(result)));
      setStatus('success');
      setCurrentStep(2);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Bill extraction failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to extract bill data. Please check the image and try again.');
    }
  };

  const retryExtraction = async () => {
    await extractBill();
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    if (!billData) return;

    setBillData((prev) => {
      if (!prev) return null;
      const nextItems = prev.items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };

        // If unit_price or quantity changed and total_price wasn't explicitly updated in this batch
        if (
          ('unit_price' in updates || 'quantity' in updates) &&
          !('total_price' in updates)
        ) {
          const qty = Number(updated.quantity) || 1;
          const up = Number(updated.unit_price) || 0;
          updated.total_price = roundToTwo(qty * up);
        } else if ('total_price' in updates && !('unit_price' in updates)) {
          // If total_price changed, recalculate unit_price
          const qty = Number(updated.quantity) || 1;
          const tp = Number(updated.total_price) || 0;
          updated.unit_price = roundToTwo(qty > 0 ? tp / qty : tp);
        }

        return updated;
      });

      return {
        ...prev,
        items: nextItems,
      };
    });
    setHasUnsavedChanges(true);
  };

  const addLineItem = () => {
    if (!billData) return;

    const nextId = `item_${Date.now()}`;
    const newItem: LineItem = {
      id: nextId,
      name: 'New Item',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      confidence: 1.0,
    };

    setBillData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });
    setHasUnsavedChanges(true);
  };

  const deleteLineItem = (id: string) => {
    if (!billData) return;

    setBillData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      };
    });

    // Remove item from assignments
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    setHasUnsavedChanges(true);
  };

  const updateSummary = (updates: Partial<Omit<BillData, 'items'>>) => {
    if (!billData) return;

    setBillData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
      };
    });
    setHasUnsavedChanges(true);
  };

  const syncSubtotalFromItems = () => {
    if (!billData) return;
    const itemsSum = calculateItemsSum(billData.items);
    setBillData((prev) => {
      if (!prev) return null;
      const nextSubtotal = itemsSum;
      const expectedTotal = roundToTwo(
        nextSubtotal +
          (Number(prev.tax) || 0) +
          (Number(prev.service_charge) || 0) +
          (Number(prev.tip) || 0) -
          (Number(prev.discount) || 0)
      );
      return {
        ...prev,
        subtotal: nextSubtotal,
        total: expectedTotal,
      };
    });
    setHasUnsavedChanges(true);
  };

  const autoFixTotals = () => {
    syncSubtotalFromItems();
  };

  const resetToOriginalExtraction = () => {
    if (rawBillData) {
      setBillData(JSON.parse(JSON.stringify(rawBillData)));
      setHasUnsavedChanges(false);
    }
  };

  const confirmAndContinue = () => {
    if (!billData) return;
    setHasUnsavedChanges(false);
    setCurrentStep(3);
  };

  const startNewBill = () => {
    clearFile();
    setBillData(null);
    setRawBillData(null);
    setHasUnsavedChanges(false);
    setParticipants([]);
    setAssignments({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
    setCurrentStep(1);
  };

  // Phase 3 Participant Actions
  const addParticipant = (name: string): Participant | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    // Check if participant name already exists (case-insensitive)
    const exists = participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return null;
    }

    const nextIndex = participants.length;
    const newPerson: Participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      colorIndex: nextIndex,
    };

    setParticipants((prev) => [...prev, newPerson]);
    return newPerson;
  };

  const removeParticipant = (participantId: string) => {
    // Remove person from participants
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));

    // Remove person from all item assignments
    setAssignments((prev) => {
      const nextMap: ItemAssignments = {};
      Object.keys(prev).forEach((itemId) => {
        nextMap[itemId] = prev[itemId].filter((pid) => pid !== participantId);
      });
      return nextMap;
    });
  };

  const toggleItemAssignment = (itemId: string, participantId: string) => {
    setAssignments((prev) => {
      const currentList = prev[itemId] || [];
      const isAssigned = currentList.includes(participantId);
      const nextList = isAssigned
        ? currentList.filter((id) => id !== participantId)
        : [...currentList, participantId];

      return {
        ...prev,
        [itemId]: nextList,
      };
    });
  };

  const assignEveryoneToItem = (itemId: string) => {
    if (participants.length === 0) return;
    const allIds = participants.map((p) => p.id);
    setAssignments((prev) => {
      // If already assigned to everyone, toggle clear; otherwise assign everyone
      const currentList = prev[itemId] || [];
      const isAlreadyEveryone = allIds.every((id) => currentList.includes(id));
      return {
        ...prev,
        [itemId]: isAlreadyEveryone ? [] : allIds,
      };
    });
  };

  const clearItemAssignments = (itemId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [itemId]: [],
    }));
  };

  const assignAllItemsToEveryone = () => {
    if (!billData || participants.length === 0) return;
    const allParticipantIds = participants.map((p) => p.id);
    const newAssignments: ItemAssignments = {};
    billData.items.forEach((item) => {
      newAssignments[item.id] = [...allParticipantIds];
    });
    setAssignments(newAssignments);
  };

  const resetAssignments = () => {
    if (!billData) return;
    const emptyMap: ItemAssignments = {};
    billData.items.forEach((item) => {
      emptyMap[item.id] = [];
    });
    setAssignments(emptyMap);
  };

  const goToCalculation = () => {
    if (isAllItemsAssigned) {
      setCurrentStep(5);
    }
  };

  const goToResults = () => {
    if (isAllItemsAssigned) {
      setCurrentStep(5);
    }
  };

  return (
    <BillContext.Provider
      value={{
        currentStep,
        uploadedFile,
        receiptImageUrl,
        receiptImageName,
        billData,
        rawBillData,
        status,
        errorMessage,
        isBackendOnline,
        configuredProvider,
        hasUnsavedChanges,
        participants,
        assignments,
        unassignedCount,
        isAllItemsAssigned,
        setCurrentStep,
        selectFile,
        clearFile,
        loadSampleReceipt,
        extractBill,
        retryExtraction,
        updateLineItem,
        addLineItem,
        deleteLineItem,
        updateSummary,
        syncSubtotalFromItems,
        autoFixTotals,
        resetToOriginalExtraction,
        confirmAndContinue,
        startNewBill,
        addParticipant,
        removeParticipant,
        toggleItemAssignment,
        assignEveryoneToItem,
        clearItemAssignments,
        assignAllItemsToEveryone,
        resetAssignments,
        goToCalculation,
        goToResults,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};

export const useBill = () => {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
};
