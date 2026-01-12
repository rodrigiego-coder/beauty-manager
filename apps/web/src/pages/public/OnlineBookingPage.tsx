import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Types
interface SalonInfo {
  salonId: string;
  salonName: string;
  welcomeMessage?: string;
  termsUrl?: string;
  requireTermsAcceptance: boolean;
  requirePhoneVerification: boolean;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  cancellationHours: number;
  allowRescheduling: boolean;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  basePrice: string;
}

interface Professional {
  id: string;
  name: string;
  role: string;
}

interface TimeSlot {
  date: string;
  time: string;
  endTime: string;
  professionalId: string;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  duration: number;
  price: string;
}

interface HoldResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  professionalName: string;
  serviceName: string;
  expiresAt: string;
  expiresInSeconds: number;
}

interface BookingConfirmation {
  appointmentId: string;
  date: string;
  time: string;
  professionalName: string;
  serviceName: string;
  clientAccessToken: string;
  depositRequired: boolean;
  depositAmount?: string;
  depositPixCode?: string;
}

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Steps enum
enum BookingStep {
  SERVICE = 0,
  PROFESSIONAL = 1,
  DATETIME = 2,
  VERIFICATION = 3,
  CONFIRMATION = 4,
  SUCCESS = 5,
}

export function OnlineBookingPage() {
  const { salonSlug } = useParams<{ salonSlug: string }>();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SERVICE);

  // Dados do salão
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Seleções do usuário
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Hold (reserva temporária)
  const [hold, setHold] = useState<HoldResponse | null>(null);
  const [holdTimer, setHoldTimer] = useState<number>(0);

  // Verificação de telefone
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Resultado
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // Carrega informações do salão
  useEffect(() => {
    if (!salonSlug) return;

    const loadSalonInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/info`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Salão não encontrado');
          } else {
            const data = await response.json();
            setError(data.message || 'Agendamento online não disponível');
          }
          return;
        }
        const data = await response.json();
        setSalonInfo(data);

        // Carrega serviços
        const servicesResponse = await fetch(`${API_BASE}/public/booking/${salonSlug}/services`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        }
      } catch (err) {
        setError('Erro ao carregar informações do salão');
      } finally {
        setLoading(false);
      }
    };

    loadSalonInfo();
  }, [salonSlug]);

  // Timer do hold
  useEffect(() => {
    if (!hold) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000));
      setHoldTimer(remaining);

      if (remaining === 0) {
        setHold(null);
        setError('Sua reserva expirou. Por favor, selecione outro horário.');
        setCurrentStep(BookingStep.DATETIME);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hold]);

  // Timer do cooldown OTP
  useEffect(() => {
    if (otpCooldown <= 0) return;

    const interval = setInterval(() => {
      setOtpCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Carrega profissionais quando seleciona serviço
  const loadProfessionals = useCallback(async () => {
    if (!salonSlug || !selectedService) return;

    try {
      const response = await fetch(
        `${API_BASE}/public/booking/${salonSlug}/professionals?serviceId=${selectedService.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
    }
  }, [salonSlug, selectedService]);

  useEffect(() => {
    if (selectedService) {
      loadProfessionals();
    }
  }, [selectedService, loadProfessionals]);

  // Carrega slots quando seleciona profissional e data
  const loadSlots = useCallback(async () => {
    if (!salonSlug || !selectedService || !selectedDate) return;

    try {
      const params = new URLSearchParams({
        serviceId: selectedService.id.toString(),
        startDate: selectedDate,
      });
      if (selectedProfessional) {
        params.append('professionalId', selectedProfessional.id);
      }

      const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/slots?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
  }, [salonSlug, selectedService, selectedProfessional, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate, loadSlots]);

  // Cria hold ao selecionar slot
  const createHold = async (slot: TimeSlot) => {
    if (!salonSlug) return;

    try {
      const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: slot.professionalId,
          serviceId: slot.serviceId,
          date: slot.date,
          startTime: slot.time,
          endTime: slot.endTime,
          clientPhone: phone || '00000000000', // Placeholder até verificar
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erro ao reservar horário');
        return false;
      }

      const holdData = await response.json();
      setHold(holdData);
      setSelectedSlot(slot);
      return true;
    } catch (err) {
      setError('Erro ao reservar horário');
      return false;
    }
  };

  // Envia OTP
  const sendOtp = async () => {
    if (!salonSlug || !phone || phone.length < 10) {
      setError('Digite um telefone válido');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          type: 'PHONE_VERIFICATION',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao enviar código');
        return;
      }

      setOtpSent(true);
      setOtpCooldown(60);
      setError(null);
    } catch (err) {
      setError('Erro ao enviar código');
    }
  };

  // Verifica OTP
  const verifyOtp = async () => {
    if (!salonSlug || !otpCode || otpCode.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          code: otpCode,
          type: 'PHONE_VERIFICATION',
        }),
      });

      const data = await response.json();

      if (!data.valid) {
        setError(data.message || 'Código inválido');
        return;
      }

      setPhoneVerified(true);
      setError(null);
      setCurrentStep(BookingStep.CONFIRMATION);
    } catch (err) {
      setError('Erro ao verificar código');
    }
  };

  // Confirma agendamento
  const confirmBooking = async () => {
    if (!salonSlug || !selectedSlot || !clientName) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (salonInfo?.requireTermsAcceptance && !acceptedTerms) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/public/booking/${salonSlug}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: selectedSlot.professionalId,
          serviceId: selectedSlot.serviceId,
          date: selectedSlot.date,
          time: selectedSlot.time,
          clientPhone: phone.replace(/\D/g, ''),
          clientName,
          clientEmail: clientEmail || undefined,
          notes: notes || undefined,
          acceptedTerms,
          otpCode: salonInfo?.requirePhoneVerification ? otpCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao confirmar agendamento');
        return;
      }

      setConfirmation(data);
      setCurrentStep(BookingStep.SUCCESS);
      setError(null);
    } catch (err) {
      setError('Erro ao confirmar agendamento');
    }
  };

  // Formata telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Formata preço
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  // Formata data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  // Gera próximos dias disponíveis
  const getAvailableDates = () => {
    if (!salonInfo) return [];
    const dates: string[] = [];
    const today = new Date();
    today.setHours(today.getHours() + salonInfo.minAdvanceHours);

    for (let i = 0; i < salonInfo.maxAdvanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !salonInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (currentStep === BookingStep.SUCCESS && confirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendamento Confirmado!</h1>
          <p className="text-gray-600 mb-6">Seu horário foi reservado com sucesso.</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Serviço:</span>
              <span className="font-medium">{confirmation.serviceName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Profissional:</span>
              <span className="font-medium">{confirmation.professionalName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium">{formatDate(confirmation.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Horário:</span>
              <span className="font-medium">{confirmation.time}</span>
            </div>
          </div>

          {confirmation.depositRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 font-medium mb-2">
                Sinal de {formatPrice(confirmation.depositAmount || '0')} necessário
              </p>
              <p className="text-yellow-600 text-sm">
                Pague via PIX para confirmar definitivamente seu horário.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Você receberá uma confirmação por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // Steps indicator
  const steps = ['Serviço', 'Profissional', 'Horário', 'Verificação', 'Confirmação'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{salonInfo?.salonName}</h1>
          {salonInfo?.welcomeMessage && (
            <p className="text-gray-600 mt-2">{salonInfo.welcomeMessage}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-purple-600 text-white'
                    : index === currentStep
                    ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 ${
                    index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Hold timer */}
        {hold && holdTimer > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-center">
            <span className="text-yellow-800">
              Horário reservado por{' '}
              <span className="font-bold">{Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, '0')}</span>
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Step 1: Service Selection */}
          {currentStep === BookingStep.SERVICE && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Escolha o serviço</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setCurrentStep(BookingStep.PROFESSIONAL);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedService?.id === service.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">{service.durationMinutes} min</p>
                      </div>
                      <span className="text-purple-600 font-bold">{formatPrice(service.basePrice)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Professional Selection */}
          {currentStep === BookingStep.PROFESSIONAL && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Escolha o profissional</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedProfessional(null);
                    setCurrentStep(BookingStep.DATETIME);
                  }}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all"
                >
                  <h3 className="font-medium text-gray-800">Sem preferência</h3>
                  <p className="text-sm text-gray-500">Qualquer profissional disponível</p>
                </button>
                {professionals.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      setSelectedProfessional(prof);
                      setCurrentStep(BookingStep.DATETIME);
                    }}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all"
                  >
                    <h3 className="font-medium text-gray-800">{prof.name}</h3>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentStep(BookingStep.SERVICE)}
                className="mt-4 text-purple-600 hover:underline"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 3: Date/Time Selection */}
          {currentStep === BookingStep.DATETIME && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Escolha a data e horário</h2>

              {/* Date selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getAvailableDates().slice(0, 14).map((date) => {
                    const d = new Date(date + 'T12:00:00');
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xs text-gray-500">
                          {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="font-bold">{d.getDate()}</div>
                        <div className="text-xs text-gray-500">
                          {d.toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                  {slots.filter(s => s.date === selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum horário disponível nesta data</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots
                        .filter((s) => s.date === selectedDate)
                        .map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={async () => {
                              const success = await createHold(slot);
                              if (success) {
                                setCurrentStep(BookingStep.VERIFICATION);
                              }
                            }}
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all text-center"
                          >
                            <div className="font-medium">{slot.time}</div>
                            {!selectedProfessional && (
                              <div className="text-xs text-gray-500">{slot.professionalName}</div>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setCurrentStep(BookingStep.PROFESSIONAL)}
                className="mt-4 text-purple-600 hover:underline"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 4: Phone Verification */}
          {currentStep === BookingStep.VERIFICATION && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Verificação de telefone</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seu telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                  disabled={otpSent && phoneVerified}
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  disabled={phone.replace(/\D/g, '').length < 10}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Enviar código de verificação
                </button>
              ) : !phoneVerified ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de verificação
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={verifyOtp}
                    disabled={otpCode.length !== 6}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all mb-3"
                  >
                    Verificar código
                  </button>

                  <button
                    onClick={sendOtp}
                    disabled={otpCooldown > 0}
                    className="w-full text-center text-purple-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    {otpCooldown > 0 ? `Reenviar em ${otpCooldown}s` : 'Reenviar código'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-green-500 text-4xl mb-2">✓</div>
                  <p className="text-green-600 font-medium">Telefone verificado!</p>
                </div>
              )}

              {!salonInfo?.requirePhoneVerification && !phoneVerified && (
                <button
                  onClick={() => {
                    if (phone.replace(/\D/g, '').length >= 10) {
                      setCurrentStep(BookingStep.CONFIRMATION);
                    } else {
                      setError('Digite um telefone válido');
                    }
                  }}
                  className="w-full mt-4 text-gray-500 hover:text-purple-600"
                >
                  Pular verificação →
                </button>
              )}

              <button
                onClick={() => {
                  setHold(null);
                  setCurrentStep(BookingStep.DATETIME);
                }}
                className="mt-4 text-purple-600 hover:underline"
              >
                ← Voltar (libera reserva)
              </button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === BookingStep.CONFIRMATION && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirme seus dados</h2>

              {/* Resumo */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-purple-800 mb-2">Resumo do agendamento</h3>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>Serviço:</strong> {selectedService?.name}</p>
                  <p><strong>Profissional:</strong> {selectedSlot?.professionalName || 'Qualquer'}</p>
                  <p><strong>Data:</strong> {selectedSlot && formatDate(selectedSlot.date)}</p>
                  <p><strong>Horário:</strong> {selectedSlot?.time}</p>
                  <p><strong>Valor:</strong> {selectedService && formatPrice(selectedService.basePrice)}</p>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcional)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                    rows={3}
                    placeholder="Alguma informação adicional?"
                  />
                </div>

                {salonInfo?.requireTermsAcceptance && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">
                      Li e aceito os{' '}
                      <a
                        href={salonInfo.termsUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 underline"
                      >
                        termos de uso e política de cancelamento
                      </a>
                    </span>
                  </label>
                )}
              </div>

              <button
                onClick={confirmBooking}
                disabled={!clientName}
                className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Confirmar Agendamento
              </button>

              <button
                onClick={() => setCurrentStep(BookingStep.VERIFICATION)}
                className="mt-4 text-purple-600 hover:underline w-full text-center"
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Agendamento online por Beauty Manager
        </p>
      </div>
    </div>
  );
}

export default OnlineBookingPage;
