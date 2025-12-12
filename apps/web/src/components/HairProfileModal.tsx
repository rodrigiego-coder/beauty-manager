import { useState, useEffect } from 'react';
import {
  X,
  User,
  Droplet,
  Scissors,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import {
  HairProfile,
  HairProfileFormData,
  HairType,
  HairThickness,
  HairLength,
  HairPorosity,
  ScalpType,
  HairTypeLabels,
  HairThicknessLabels,
  HairLengthLabels,
  HairPorosityLabels,
  ScalpTypeLabels,
  ChemicalHistoryLabels,
  HairConcernsLabels,
} from '../types';

interface HairProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onSave: (data: HairProfileFormData) => Promise<void>;
  existingProfile?: HairProfile | null;
}

export function HairProfileModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onSave,
  existingProfile,
}: HairProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'characteristics' | 'history' | 'concerns'>('characteristics');

  // Form state
  const [hairType, setHairType] = useState<HairType | ''>('');
  const [hairThickness, setHairThickness] = useState<HairThickness | ''>('');
  const [hairLength, setHairLength] = useState<HairLength | ''>('');
  const [hairPorosity, setHairPorosity] = useState<HairPorosity | ''>('');
  const [scalpType, setScalpType] = useState<ScalpType | ''>('');
  const [chemicalHistory, setChemicalHistory] = useState<string[]>([]);
  const [mainConcerns, setMainConcerns] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [currentProducts, setCurrentProducts] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing profile
  useEffect(() => {
    if (existingProfile) {
      setHairType(existingProfile.hairType || '');
      setHairThickness(existingProfile.hairThickness || '');
      setHairLength(existingProfile.hairLength || '');
      setHairPorosity(existingProfile.hairPorosity || '');
      setScalpType(existingProfile.scalpType || '');
      setChemicalHistory(existingProfile.chemicalHistory || []);
      setMainConcerns(existingProfile.mainConcerns || []);
      setAllergies(existingProfile.allergies || '');
      setCurrentProducts(existingProfile.currentProducts || '');
      setNotes(existingProfile.notes || '');
    } else {
      // Reset form
      setHairType('');
      setHairThickness('');
      setHairLength('');
      setHairPorosity('');
      setScalpType('');
      setChemicalHistory([]);
      setMainConcerns([]);
      setAllergies('');
      setCurrentProducts('');
      setNotes('');
    }
  }, [existingProfile, isOpen]);

  const toggleChemicalHistory = (value: string) => {
    setChemicalHistory(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleConcern = (value: string) => {
    setMainConcerns(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: HairProfileFormData = {
        clientId,
        hairType: hairType || undefined,
        hairThickness: hairThickness || undefined,
        hairLength: hairLength || undefined,
        hairPorosity: hairPorosity || undefined,
        scalpType: scalpType || undefined,
        chemicalHistory,
        mainConcerns,
        allergies: allergies || undefined,
        currentProducts: currentProducts || undefined,
        notes: notes || undefined,
      };
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'characteristics', label: 'Características', icon: User },
    { id: 'history', label: 'Histórico', icon: Droplet },
    { id: 'concerns', label: 'Necessidades', icon: AlertCircle },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Perfil Capilar</h2>
              <p className="text-sm text-white/80">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'characteristics' && (
            <div className="space-y-6">
              {/* Tipo de Cabelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cabelo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(HairTypeLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setHairType(value as HairType)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        hairType === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espessura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Espessura do Fio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(HairThicknessLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setHairThickness(value as HairThickness)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        hairThickness === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comprimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprimento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(HairLengthLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setHairLength(value as HairLength)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        hairLength === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Porosidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porosidade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(HairPorosityLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setHairPorosity(value as HairPorosity)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        hairPorosity === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Couro Cabeludo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Couro Cabeludo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(ScalpTypeLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setScalpType(value as ScalpType)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        scalpType === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Histórico Químico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histórico Químico (selecione todos que se aplicam)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ChemicalHistoryLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => toggleChemicalHistory(value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                        chemicalHistory.includes(value)
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {chemicalHistory.includes(value) && (
                        <Check className="w-4 h-4" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Produtos Atuais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produtos que Usa Atualmente
                </label>
                <textarea
                  value={currentProducts}
                  onChange={(e) => setCurrentProducts(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Ex: Shampoo X, Condicionador Y, Creme de pentear Z..."
                />
              </div>

              {/* Alergias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alergias ou Sensibilidades
                </label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Liste alergias conhecidas a produtos ou ingredientes..."
                />
              </div>
            </div>
          )}

          {activeTab === 'concerns' && (
            <div className="space-y-6">
              {/* Necessidades/Problemas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principais Necessidades/Problemas (selecione todos que se aplicam)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(HairConcernsLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => toggleConcern(value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                        mainConcerns.includes(value)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {mainConcerns.includes(value) && (
                        <Check className="w-4 h-4" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Informações adicionais sobre o cabelo da cliente..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {existingProfile ? 'Atualizar Perfil' : 'Salvar Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}
