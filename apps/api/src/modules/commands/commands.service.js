"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let CommandsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CommandsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CommandsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        cashRegistersService;
        clientPackagesService;
        clientsService;
        commissionsService;
        loyaltyService;
        productsService;
        recipesService;
        serviceConsumptionsService;
        logger = new common_1.Logger(CommandsService.name);
        constructor(db, cashRegistersService, clientPackagesService, clientsService, commissionsService, loyaltyService, productsService, recipesService, serviceConsumptionsService) {
            this.db = db;
            this.cashRegistersService = cashRegistersService;
            this.clientPackagesService = clientPackagesService;
            this.clientsService = clientsService;
            this.commissionsService = commissionsService;
            this.loyaltyService = loyaltyService;
            this.productsService = productsService;
            this.recipesService = recipesService;
            this.serviceConsumptionsService = serviceConsumptionsService;
        }
        /**
         * Lista comandas do salão com filtros
         */
        async findAll(salonId, status) {
            // Query base com LEFT JOIN para incluir dados do cliente
            const baseQuery = this.db
                .select({
                id: database_1.commands.id,
                salonId: database_1.commands.salonId,
                clientId: database_1.commands.clientId,
                appointmentId: database_1.commands.appointmentId,
                cardNumber: database_1.commands.cardNumber,
                code: database_1.commands.code,
                status: database_1.commands.status,
                openedAt: database_1.commands.openedAt,
                openedById: database_1.commands.openedById,
                serviceClosedAt: database_1.commands.serviceClosedAt,
                serviceClosedById: database_1.commands.serviceClosedById,
                cashierClosedAt: database_1.commands.cashierClosedAt,
                cashierClosedById: database_1.commands.cashierClosedById,
                totalGross: database_1.commands.totalGross,
                totalDiscounts: database_1.commands.totalDiscounts,
                totalNet: database_1.commands.totalNet,
                notes: database_1.commands.notes,
                createdAt: database_1.commands.createdAt,
                updatedAt: database_1.commands.updatedAt,
                // Dados do cliente
                clientName: database_1.clients.name,
                clientPhone: database_1.clients.phone,
            })
                .from(database_1.commands)
                .leftJoin(database_1.clients, (0, drizzle_orm_1.eq)(database_1.commands.clientId, database_1.clients.id));
            if (status) {
                // Suporta múltiplos status separados por vírgula (ex: "OPEN,IN_SERVICE,WAITING_PAYMENT")
                const statusList = status.split(',').map(s => s.trim());
                if (statusList.length === 1) {
                    return baseQuery
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.commands.status, statusList[0])))
                        .orderBy((0, drizzle_orm_1.desc)(database_1.commands.openedAt));
                }
                // Múltiplos status usando IN
                return baseQuery
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.inArray)(database_1.commands.status, statusList)))
                    .orderBy((0, drizzle_orm_1.desc)(database_1.commands.openedAt));
            }
            return baseQuery
                .where((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.commands.openedAt));
        }
        /**
         * Lista comandas abertas (não fechadas/canceladas)
         */
        async findOpen(salonId) {
            return this.db
                .select()
                .from(database_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CANCELED')))
                .orderBy((0, drizzle_orm_1.desc)(database_1.commands.openedAt));
        }
        /**
         * Lista clientes do salão para seleção em comandas
         */
        async getClients(salonId) {
            return this.clientsService.findAll({ salonId, includeInactive: false });
        }
        /**
         * Busca comanda por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.commands)
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca comanda por número do cartão
         */
        async findByCardNumber(salonId, cardNumber) {
            const result = await this.db
                .select()
                .from(database_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.commands.cardNumber, cardNumber), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CANCELED')))
                .limit(1);
            return result[0] || null;
        }
        /**
           * Acesso rápido: busca ou cria comanda automaticamente
           */
        async quickAccess(salonId, code, currentUser) {
            // Valida range 1-999
            this.validateCommandNumber(code);
            const openCommand = await this.findByCardNumber(salonId, code);
            if (openCommand) {
                return {
                    status: 'FOUND',
                    action: 'OPEN_EXISTING',
                    commandId: openCommand.id,
                    currentStatus: openCommand.status,
                    command: openCommand,
                };
            }
            // Verifica se existe caixa aberto antes de criar nova comanda
            const cashRegister = await this.cashRegistersService.getCurrent(salonId);
            if (!cashRegister) {
                throw new common_1.BadRequestException('Abra o caixa antes de criar comandas');
            }
            const closedCommand = await this.db
                .select()
                .from(database_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.commands.cardNumber, code)))
                .orderBy((0, drizzle_orm_1.desc)(database_1.commands.createdAt))
                .limit(1);
            if (closedCommand.length > 0 && (closedCommand[0].status === 'CLOSED' || closedCommand[0].status === 'CANCELED')) {
                const newCommand = await this.open(salonId, { cardNumber: code }, currentUser, true);
                return {
                    status: 'CREATED',
                    action: 'CREATED_NEW',
                    commandId: newCommand.id,
                    currentStatus: newCommand.status,
                    command: newCommand,
                    message: `Comanda anterior estava ${closedCommand[0].status === 'CLOSED' ? 'fechada' : 'cancelada'}. Nova comanda criada.`,
                };
            }
            const newCommand = await this.open(salonId, { cardNumber: code }, currentUser, true);
            return {
                status: 'CREATED',
                action: 'CREATED_NEW',
                commandId: newCommand.id,
                currentStatus: newCommand.status,
                command: newCommand,
            };
        }
        /**
         * Abre uma nova comanda
         */
        async open(salonId, data, currentUser, skipCashCheck = false) {
            // Verifica se existe caixa aberto (a menos que já foi verificado)
            if (!skipCashCheck) {
                const cashRegister = await this.cashRegistersService.getCurrent(salonId);
                if (!cashRegister) {
                    throw new common_1.BadRequestException('Abra o caixa antes de criar comandas');
                }
            }
            // Se cardNumber informado, valida range 1-999
            let cardNumber;
            if (data.cardNumber?.trim()) {
                cardNumber = data.cardNumber.trim();
                this.validateCommandNumber(cardNumber);
            }
            else {
                // Gera automaticamente (primeiro disponível)
                cardNumber = await this.generateNextNumber(salonId);
            }
            // Verifica se já existe comanda aberta com este cartão
            const existing = await this.findByCardNumber(salonId, cardNumber);
            if (existing) {
                throw new common_1.BadRequestException(`Ja existe uma comanda aberta com o cartao ${cardNumber}`);
            }
            // Gera código sequencial
            const code = await this.generateCode(salonId);
            // Cria a comanda
            const [command] = await this.db
                .insert(database_1.commands)
                .values({
                salonId,
                cardNumber,
                code,
                clientId: data.clientId || null,
                notes: data.notes || null,
                openedById: currentUser.id,
                status: 'OPEN',
            })
                .returning();
            // Registra evento
            await this.addEvent(command.id, currentUser.id, 'OPENED', {
                cardNumber,
                clientId: data.clientId,
            });
            return command;
        }
        /**
         * Adiciona item à comanda
         */
        async addItem(commandId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            // L1 FIX: Cliente obrigatório para adicionar itens
            if (!command.clientId) {
                throw new common_1.BadRequestException('Vincule um cliente antes de adicionar itens');
            }
            const quantity = data.quantity || 1;
            const discount = data.discount || 0;
            const totalPrice = (quantity * data.unitPrice) - discount;
            // ========================================
            // P0: Calcular effectivePerformerId para SERVICE
            // ========================================
            let effectivePerformerId = data.performerId || null;
            if (data.type === 'SERVICE' && !data.performerId) {
                // a) STYLIST logado => autoatribui para si
                if (currentUser.role === 'STYLIST') {
                    effectivePerformerId = currentUser.id;
                    this.logger.log(`[addItem] SERVICE sem performerId - STYLIST logado, autoatribuído: ${currentUser.id}`);
                }
                // b) Comanda veio de agendamento => usa professionalId do appointment
                else if (command.appointmentId) {
                    const [apt] = await this.db
                        .select({ professionalId: database_1.appointments.professionalId })
                        .from(database_1.appointments)
                        .where((0, drizzle_orm_1.eq)(database_1.appointments.id, command.appointmentId))
                        .limit(1);
                    if (apt?.professionalId) {
                        effectivePerformerId = apt.professionalId;
                        this.logger.log(`[addItem] SERVICE sem performerId - usando professionalId do agendamento: ${apt.professionalId}`);
                    }
                }
                // c) Comanda aberta por STYLIST => usa openedById
                else if (command.openedById) {
                    const [opener] = await this.db
                        .select({ id: database_1.users.id, role: database_1.users.role })
                        .from(database_1.users)
                        .where((0, drizzle_orm_1.eq)(database_1.users.id, command.openedById))
                        .limit(1);
                    if (opener?.role === 'STYLIST') {
                        effectivePerformerId = opener.id;
                        this.logger.log(`[addItem] SERVICE sem performerId - usando openedById (STYLIST): ${opener.id}`);
                    }
                }
                // d) Se ainda não resolveu => erro para OWNER/MANAGER
                if (!effectivePerformerId) {
                    throw new common_1.BadRequestException('Serviço requer profissional executante (performerId). Selecione o profissional que realizará o atendimento.');
                }
            }
            // Se for PRODUTO, baixar estoque antes de adicionar
            // HARDENING: validação multi-tenant + existência do produto
            if (data.type === 'PRODUCT' && data.referenceId) {
                const productId = parseInt(data.referenceId, 10);
                if (isNaN(productId)) {
                    throw new common_1.BadRequestException('referenceId invalido para PRODUCT');
                }
                // Verificação multi-tenant: produto deve pertencer ao mesmo salão
                const product = await this.productsService.findById(productId);
                if (!product) {
                    throw new common_1.BadRequestException(`Produto ID ${productId} nao encontrado`);
                }
                if (product.salonId !== command.salonId) {
                    throw new common_1.BadRequestException('Produto nao pertence a este salao');
                }
                // Validação: produto deve ser vendável (isRetail = true)
                if (!product.isRetail) {
                    throw new common_1.BadRequestException(`Produto "${product.name}" não está habilitado para venda. ` +
                        `Habilite a opção "Venda na loja" para vendê-lo.`);
                }
                // Baixar estoque RETAIL (loja)
                await this.productsService.adjustStockWithLocation({
                    productId,
                    salonId: command.salonId,
                    userId: currentUser.id,
                    quantity: -quantity, // negativo = saída
                    locationType: 'RETAIL', // estoque da LOJA (venda)
                    movementType: 'SALE',
                    reason: `Venda - Comanda ${command.cardNumber}`,
                    referenceType: 'command',
                    referenceId: command.id,
                });
            }
            // ========================================
            // PACOTE: Verificar e consumir sessão do pacote para SERVIÇOS
            // ========================================
            let clientPackageId = null;
            let clientPackageUsageId = null;
            let paidByPackage = false;
            let finalTotalPrice = totalPrice;
            if (data.type === 'SERVICE' && data.referenceId && command.clientId) {
                const serviceId = parseInt(data.referenceId, 10);
                if (!isNaN(serviceId)) {
                    // Verifica se cliente tem pacote válido para este serviço
                    const packageCheck = await this.clientPackagesService.hasValidPackageForService(command.clientId, serviceId);
                    if (packageCheck.hasPackage && packageCheck.clientPackage && packageCheck.balance) {
                        try {
                            // Consome a sessão do pacote
                            const consumeResult = await this.clientPackagesService.consumeSession({
                                salonId: command.salonId,
                                clientPackageId: packageCheck.clientPackage.id,
                                serviceId,
                                commandId,
                                professionalId: effectivePerformerId || undefined,
                                notes: `Auto-consumed via command ${command.cardNumber}`,
                            });
                            clientPackageId = packageCheck.clientPackage.id;
                            clientPackageUsageId = consumeResult.usage.id;
                            paidByPackage = true;
                            finalTotalPrice = 0; // Serviço pago pelo pacote = R$ 0,00
                            this.logger.log(`[addItem] Sessão consumida do pacote: clientPackageId=${clientPackageId}, ` +
                                `serviceId=${serviceId}, remaining=${consumeResult.balance.remainingSessions}`);
                        }
                        catch (error) {
                            // Se falhar consumir pacote, continua como item normal (pago)
                            this.logger.warn(`[addItem] Falha ao consumir pacote (item será cobrado): ${error.message}`);
                        }
                    }
                }
            }
            // Adiciona o item
            const [item] = await this.db
                .insert(database_1.commandItems)
                .values({
                commandId,
                type: data.type,
                description: data.description,
                quantity: quantity.toString(),
                unitPrice: paidByPackage ? '0' : data.unitPrice.toString(),
                discount: discount.toString(),
                totalPrice: finalTotalPrice.toString(),
                performerId: effectivePerformerId,
                referenceId: data.referenceId || null,
                variantId: data.variantId || null, // Variante da receita (tamanho cabelo)
                addedById: currentUser.id,
                clientPackageId,
                clientPackageUsageId,
                paidByPackage,
            })
                .returning();
            // Atualiza totais da comanda
            await this.recalculateTotals(commandId);
            // Atualiza status para IN_SERVICE se estava OPEN
            if (command.status === 'OPEN') {
                await this.db
                    .update(database_1.commands)
                    .set({ status: 'IN_SERVICE', updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId));
            }
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'ITEM_ADDED', {
                itemId: item.id,
                type: data.type,
                description: data.description,
                quantity,
                unitPrice: paidByPackage ? 0 : data.unitPrice,
                totalPrice: finalTotalPrice,
                performerId: effectivePerformerId,
                performerAutoAssigned: data.type === 'SERVICE' && !data.performerId && !!effectivePerformerId,
                paidByPackage,
                clientPackageId,
                clientPackageUsageId,
            });
            return item;
        }
        /**
         * Atualiza item da comanda
         */
        async updateItem(commandId, itemId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            const [existingItem] = await this.db
                .select()
                .from(database_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commandItems.id, itemId), (0, drizzle_orm_1.eq)(database_1.commandItems.commandId, commandId)))
                .limit(1);
            if (!existingItem) {
                throw new common_1.NotFoundException('Item nao encontrado');
            }
            if (existingItem.canceledAt) {
                throw new common_1.BadRequestException('Item ja foi cancelado');
            }
            const oldQuantity = parseFloat(existingItem.quantity);
            const quantity = data.quantity ?? oldQuantity;
            const unitPrice = data.unitPrice ?? parseFloat(existingItem.unitPrice);
            const discount = data.discount ?? parseFloat(existingItem.discount || '0');
            const totalPrice = (quantity * unitPrice) - discount;
            // Se for PRODUTO e quantidade mudou, ajustar estoque RETAIL
            if (existingItem.type === 'PRODUCT' && existingItem.referenceId && quantity !== oldQuantity) {
                const productId = parseInt(existingItem.referenceId, 10);
                if (!isNaN(productId)) {
                    const diff = quantity - oldQuantity;
                    // diff positivo = aumentou quantidade (saída adicional)
                    // diff negativo = diminuiu quantidade (devolução)
                    await this.productsService.adjustStockWithLocation({
                        productId,
                        salonId: command.salonId,
                        userId: currentUser.id,
                        quantity: -diff, // negativo de diff: aumentou=saída, diminuiu=entrada
                        locationType: 'RETAIL',
                        movementType: diff > 0 ? 'SALE' : 'RETURN',
                        reason: diff > 0
                            ? `Ajuste qty (+${diff}) - Comanda ${command.cardNumber}`
                            : `Devolução qty (${diff}) - Comanda ${command.cardNumber}`,
                        referenceType: 'command',
                        referenceId: command.id,
                    });
                }
            }
            const [updatedItem] = await this.db
                .update(database_1.commandItems)
                .set({
                quantity: quantity.toString(),
                unitPrice: unitPrice.toString(),
                discount: discount.toString(),
                totalPrice: totalPrice.toString(),
                performerId: data.performerId ?? existingItem.performerId,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commandItems.id, itemId))
                .returning();
            // Recalcula totais
            await this.recalculateTotals(commandId);
            // Detecta troca de performer para auditoria
            const oldPerformerId = existingItem.performerId;
            const newPerformerId = data.performerId ?? existingItem.performerId;
            const performerChanged = data.performerId !== undefined && data.performerId !== oldPerformerId;
            // Registra evento com auditoria de troca de performer
            await this.addEvent(commandId, currentUser.id, 'ITEM_UPDATED', {
                itemId,
                from: {
                    quantity: existingItem.quantity,
                    unitPrice: existingItem.unitPrice,
                    discount: existingItem.discount,
                    ...(performerChanged && { performerId: oldPerformerId }),
                },
                to: {
                    quantity,
                    unitPrice,
                    discount,
                    ...(performerChanged && { performerId: newPerformerId }),
                },
                ...(performerChanged && { performerChanged: true }),
            });
            return updatedItem;
        }
        /**
         * Remove (cancela) item da comanda
         */
        async removeItem(commandId, itemId, reason, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            const [existingItem] = await this.db
                .select()
                .from(database_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commandItems.id, itemId), (0, drizzle_orm_1.eq)(database_1.commandItems.commandId, commandId)))
                .limit(1);
            if (!existingItem) {
                throw new common_1.NotFoundException('Item nao encontrado');
            }
            if (existingItem.canceledAt) {
                throw new common_1.BadRequestException('Item ja foi cancelado');
            }
            // Se for PRODUTO, devolver estoque RETAIL
            if (existingItem.type === 'PRODUCT' && existingItem.referenceId) {
                const productId = parseInt(existingItem.referenceId, 10);
                if (!isNaN(productId)) {
                    const qty = parseFloat(existingItem.quantity);
                    await this.productsService.adjustStockWithLocation({
                        productId,
                        salonId: command.salonId,
                        userId: currentUser.id,
                        quantity: qty, // positivo = entrada (devolução)
                        locationType: 'RETAIL',
                        movementType: 'RETURN',
                        reason: `Cancelamento item - Comanda ${command.cardNumber}`,
                        referenceType: 'command',
                        referenceId: command.id,
                    });
                }
            }
            // ========================================
            // PACOTE: Reverter sessão se item foi pago por pacote
            // ========================================
            if (existingItem.paidByPackage && existingItem.clientPackageUsageId) {
                try {
                    await this.clientPackagesService.revertSession(existingItem.clientPackageUsageId, `Reverted due to item cancellation - Command ${command.cardNumber}${reason ? `: ${reason}` : ''}`);
                    this.logger.log(`[removeItem] Sessão revertida: usageId=${existingItem.clientPackageUsageId}, ` +
                        `itemId=${itemId}`);
                }
                catch (error) {
                    // Log warning mas não bloqueia cancelamento
                    this.logger.warn(`[removeItem] Falha ao reverter sessão do pacote (item cancelado mesmo assim): ${error.message}`);
                }
            }
            const [canceledItem] = await this.db
                .update(database_1.commandItems)
                .set({
                canceledAt: new Date(),
                canceledById: currentUser.id,
                cancelReason: reason || null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commandItems.id, itemId))
                .returning();
            // Recalcula totais
            await this.recalculateTotals(commandId);
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'ITEM_REMOVED', {
                itemId,
                description: existingItem.description,
                totalPrice: existingItem.totalPrice,
                reason,
                paidByPackage: existingItem.paidByPackage,
                packageSessionReverted: existingItem.paidByPackage && !!existingItem.clientPackageUsageId,
            });
            return canceledItem;
        }
        /**
         * Aplica desconto geral na comanda
         */
        async applyDiscount(commandId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            const oldDiscount = parseFloat(command.totalDiscounts || '0');
            const newDiscount = oldDiscount + data.discountAmount;
            const totalNet = parseFloat(command.totalGross || '0') - newDiscount;
            const [updatedCommand] = await this.db
                .update(database_1.commands)
                .set({
                totalDiscounts: newDiscount.toString(),
                totalNet: totalNet.toString(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'DISCOUNT_APPLIED', {
                amount: data.discountAmount,
                reason: data.reason,
                oldDiscount,
                newDiscount,
            });
            return updatedCommand;
        }
        /**
         * Encerra os serviços da comanda
         * Consome automaticamente os produtos do BOM (receita versionada) de cada serviço
         */
        async closeService(commandId, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            if (command.status === 'WAITING_PAYMENT') {
                throw new common_1.BadRequestException('Servicos ja foram encerrados');
            }
            // ========================================
            // PACOTE 5: Consumo automático via receitas versionadas
            // ========================================
            const items = await this.getItems(commandId);
            const serviceItems = items.filter(item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId);
            let recipeProcessedCount = 0;
            // Processar consumo de receita para cada item de SERVIÇO
            for (const item of serviceItems) {
                const serviceId = parseInt(item.referenceId, 10);
                if (isNaN(serviceId))
                    continue;
                try {
                    await this.processRecipeConsumption({
                        serviceId,
                        salonId: command.salonId,
                        commandId: command.id,
                        commandItemId: item.id,
                        userId: currentUser.id,
                        variantId: item.variantId || null,
                    });
                    recipeProcessedCount++;
                }
                catch (error) {
                    // Logar warning mas NÃO bloquear fechamento do serviço
                    this.logger.warn(`Erro no consumo de receita (não bloqueante): commandItemId=${item.id}, ` +
                        `serviceId=${serviceId}, erro=${error.message}`);
                }
            }
            // Atualiza status da comanda
            const [updatedCommand] = await this.db
                .update(database_1.commands)
                .set({
                status: 'WAITING_PAYMENT',
                serviceClosedAt: new Date(),
                serviceClosedById: currentUser.id,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento SERVICE_CLOSED
            await this.addEvent(commandId, currentUser.id, 'SERVICE_CLOSED', {
                totalGross: command.totalGross,
                totalNet: command.totalNet,
            });
            // Registra evento RECIPE_CONSUMED se houve processamento
            if (recipeProcessedCount > 0) {
                await this.addEvent(commandId, currentUser.id, 'RECIPE_CONSUMED', {
                    servicesCount: serviceItems.length,
                    itemsProcessed: recipeProcessedCount,
                });
            }
            return updatedCommand;
        }
        /**
         * Calcula valores de taxa/desconto para um pagamento
         */
        calculatePaymentFee(amount, paymentMethod, destination) {
            const grossAmount = amount;
            let feeAmount = 0;
            // Prioridade: destino > método
            const rule = destination?.feeValue && parseFloat(destination.feeValue) > 0
                ? destination
                : paymentMethod;
            if (rule?.feeType && rule?.feeMode && rule?.feeValue) {
                const feeValue = parseFloat(rule.feeValue);
                if (rule.feeMode === 'PERCENT') {
                    feeAmount = (amount * feeValue) / 100;
                }
                else {
                    feeAmount = feeValue;
                }
            }
            // netAmount é sempre grossAmount - feeAmount (taxa reduz o líquido)
            const netAmount = grossAmount - feeAmount;
            return { grossAmount, feeAmount, netAmount };
        }
        /**
         * Adiciona pagamento à comanda (com auto-close se quitado)
         */
        async addPayment(commandId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED') {
                throw new common_1.BadRequestException('Comanda ja encerrada');
            }
            if (command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda foi cancelada');
            }
            // Valida que tem method OU paymentMethodId
            if (!data.method && !data.paymentMethodId) {
                throw new common_1.BadRequestException('Informe method ou paymentMethodId');
            }
            // Busca forma de pagamento configurada (se fornecida)
            let paymentMethod = null;
            if (data.paymentMethodId) {
                const result = await this.db
                    .select()
                    .from(database_1.paymentMethods)
                    .where((0, drizzle_orm_1.eq)(database_1.paymentMethods.id, data.paymentMethodId))
                    .limit(1);
                paymentMethod = result[0] || null;
                if (!paymentMethod) {
                    throw new common_1.BadRequestException('Forma de pagamento nao encontrada');
                }
                if (paymentMethod.salonId !== command.salonId) {
                    throw new common_1.BadRequestException('Forma de pagamento nao pertence a este salao');
                }
            }
            // Busca destino (se fornecido)
            let destination = null;
            if (data.paymentDestinationId) {
                const result = await this.db
                    .select()
                    .from(database_1.paymentDestinations)
                    .where((0, drizzle_orm_1.eq)(database_1.paymentDestinations.id, data.paymentDestinationId))
                    .limit(1);
                destination = result[0] || null;
                if (!destination) {
                    throw new common_1.BadRequestException('Destino de pagamento nao encontrado');
                }
                if (destination.salonId !== command.salonId) {
                    throw new common_1.BadRequestException('Destino de pagamento nao pertence a este salao');
                }
            }
            // Calcula fee
            const { grossAmount, feeAmount, netAmount } = this.calculatePaymentFee(data.amount, paymentMethod, destination);
            // Determina o method legado (para compatibilidade)
            const legacyMethod = data.method || paymentMethod?.type || 'OTHER';
            // Insere pagamento
            const [payment] = await this.db
                .insert(database_1.commandPayments)
                .values({
                commandId,
                method: legacyMethod,
                amount: data.amount.toString(),
                paymentMethodId: data.paymentMethodId || null,
                paymentDestinationId: data.paymentDestinationId || null,
                grossAmount: grossAmount.toString(),
                feeAmount: feeAmount.toString(),
                netAmount: netAmount.toString(),
                notes: data.notes || null,
                receivedById: currentUser.id,
            })
                .returning();
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'PAYMENT_ADDED', {
                paymentId: payment.id,
                method: legacyMethod,
                paymentMethodId: data.paymentMethodId,
                paymentDestinationId: data.paymentDestinationId,
                grossAmount,
                feeAmount,
                netAmount,
            });
            // Verifica se quitou para auto-close
            const totalPaid = await this.getTotalPaid(commandId);
            const totalNet = parseFloat(command.totalNet || '0');
            const tolerance = 0.01; // tolerância de 1 centavo
            if (totalPaid >= totalNet - tolerance) {
                // Auto-close
                const closedCommand = await this.autoCloseCashier(commandId, currentUser);
                return {
                    payment,
                    command: closedCommand.command,
                    autoClosed: true,
                    message: 'Comanda encerrada automaticamente',
                    loyaltyPointsEarned: closedCommand.loyaltyPointsEarned,
                    tierUpgraded: closedCommand.tierUpgraded,
                    newTierName: closedCommand.newTierName,
                };
            }
            // Atualiza command para retornar
            const updatedCommand = await this.findById(commandId);
            return {
                payment,
                command: updatedCommand,
                autoClosed: false,
                message: 'Pagamento registrado',
            };
        }
        /**
         * Calcula total pago (usando netAmount quando disponível)
         */
        async getTotalPaid(commandId) {
            const payments = await this.getPayments(commandId);
            return payments.reduce((sum, p) => {
                // Usa netAmount se disponível, senão usa amount
                const value = p.netAmount ? parseFloat(p.netAmount) : parseFloat(p.amount);
                return sum + value;
            }, 0);
        }
        /**
         * Auto-close interno (chamado quando pagamento quita a comanda)
         *
         * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
         * envolvidas em try/catch para garantir que o pagamento retorne 200
         * mesmo se alguma operação secundária falhar.
         */
        async autoCloseCashier(commandId, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            // ========================================
            // PACOTE 5.2.5: Processar receitas se serviço não foi encerrado
            // ========================================
            if (!command.serviceClosedAt) {
                const items = await this.getItems(commandId);
                const serviceItems = items.filter(item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId);
                let recipeProcessedCount = 0;
                // Processar consumo de receita para cada item de SERVIÇO
                for (const item of serviceItems) {
                    const serviceId = parseInt(item.referenceId, 10);
                    if (isNaN(serviceId))
                        continue;
                    try {
                        await this.processRecipeConsumption({
                            serviceId,
                            salonId: command.salonId,
                            commandId: command.id,
                            commandItemId: item.id,
                            userId: currentUser.id,
                            variantId: item.variantId || null,
                        });
                        recipeProcessedCount++;
                    }
                    catch (error) {
                        // Logar warning mas NÃO bloquear fechamento
                        this.logger.warn(`[autoCloseCashier] Erro no consumo de receita (não bloqueante): ` +
                            `commandItemId=${item.id}, serviceId=${serviceId}, erro=${error.message}`);
                    }
                }
                if (recipeProcessedCount > 0) {
                    this.logger.log(`[autoCloseCashier] Processadas ${recipeProcessedCount} receitas para comanda ${command.cardNumber}`);
                }
            }
            // Atualiza status para CLOSED (operação crítica)
            const [closedCommand] = await this.db
                .update(database_1.commands)
                .set({
                status: 'CLOSED',
                serviceClosedAt: command.serviceClosedAt || new Date(), // marca serviço encerrado se não estava
                serviceClosedById: command.serviceClosedById || currentUser.id,
                cashierClosedAt: new Date(),
                cashierClosedById: currentUser.id,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // === OPERAÇÕES NÃO-CRÍTICAS (não devem derrubar a resposta) ===
            // Atualiza totais do caixa por método de pagamento
            try {
                const payments = await this.getPayments(commandId);
                for (const payment of payments) {
                    // Usa method para compatibilidade com caixa atual
                    await this.cashRegistersService.addSale(command.salonId, payment.method || 'OTHER', parseFloat(payment.netAmount || payment.amount));
                }
            }
            catch (err) {
                console.error('[autoCloseCashier] Erro ao atualizar totais do caixa:', err);
            }
            // Se a comanda tem cliente vinculado, atualiza totalVisits e lastVisitDate
            if (command.clientId) {
                try {
                    await this.clientsService.updateLastVisit(command.clientId);
                }
                catch (err) {
                    console.error('[autoCloseCashier] Erro ao atualizar ultima visita do cliente:', err);
                }
            }
            // Cria comissoes para itens de servico com profissional
            try {
                await this.createCommissionsForCommand(command.salonId, commandId);
            }
            catch (err) {
                console.error('[autoCloseCashier] Erro ao criar comissoes:', err);
            }
            // Processa pontos de fidelidade se cliente vinculado
            let loyaltyPointsEarned = 0;
            let tierUpgraded = false;
            let newTierName;
            if (command.clientId) {
                try {
                    const loyaltyResult = await this.loyaltyService.processCommandPoints(command.salonId, commandId, command.clientId, currentUser.id);
                    loyaltyPointsEarned = loyaltyResult.pointsEarned;
                    tierUpgraded = loyaltyResult.tierUpgraded;
                    newTierName = loyaltyResult.newTierName;
                }
                catch (err) {
                    console.error('[autoCloseCashier] Erro ao processar pontos de fidelidade:', err);
                }
            }
            // Registra evento de auto-close
            try {
                const totalPaid = await this.getTotalPaid(commandId);
                const totalNet = parseFloat(command.totalNet || '0');
                await this.addEvent(commandId, currentUser.id, 'CASHIER_CLOSED_AUTO', {
                    totalNet,
                    totalPaid,
                    change: totalPaid - totalNet,
                    clientId: command.clientId,
                    loyaltyPointsEarned,
                    tierUpgraded,
                    newTierName,
                });
            }
            catch (err) {
                console.error('[autoCloseCashier] Erro ao registrar evento:', err);
            }
            return {
                command: closedCommand,
                loyaltyPointsEarned,
                tierUpgraded,
                newTierName,
            };
        }
        /**
         * Reabre comanda fechada (apenas OWNER/MANAGER)
         */
        async reopenCommand(commandId, data, currentUser) {
            // Verifica permissão
            if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
                throw new common_1.ForbiddenException('Apenas OWNER ou MANAGER podem reabrir comandas');
            }
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.salonId !== currentUser.salonId) {
                throw new common_1.ForbiddenException('Comanda nao pertence a este salao');
            }
            if (command.status !== 'CLOSED') {
                throw new common_1.BadRequestException('Apenas comandas fechadas podem ser reabertas');
            }
            // Valida motivo
            if (!data.reason || data.reason.trim().length < 10) {
                throw new common_1.BadRequestException('Motivo deve ter pelo menos 10 caracteres');
            }
            // Reabre comanda
            const [reopenedCommand] = await this.db
                .update(database_1.commands)
                .set({
                status: 'WAITING_PAYMENT',
                cashierClosedAt: null,
                cashierClosedById: null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento de reabertura
            await this.addEvent(commandId, currentUser.id, 'COMMAND_REOPENED', {
                previousStatus: 'CLOSED',
                reason: data.reason,
                reopenedAt: new Date().toISOString(),
            });
            return reopenedCommand;
        }
        /**
         * Fecha comanda no caixa (chamada manual)
         *
         * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
         * envolvidas em try/catch para garantir que o fechamento retorne 200
         * mesmo se alguma operação secundária falhar.
         */
        async closeCashier(commandId, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED') {
                throw new common_1.BadRequestException('Comanda ja foi fechada');
            }
            if (command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda foi cancelada');
            }
            // Verifica se os pagamentos cobrem o total
            const payments = await this.getPayments(commandId);
            const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const totalNet = parseFloat(command.totalNet || '0');
            if (totalPaid < totalNet) {
                throw new common_1.BadRequestException(`Pagamento insuficiente. Total: R$ ${totalNet.toFixed(2)}, Pago: R$ ${totalPaid.toFixed(2)}`);
            }
            // Atualiza status para CLOSED (operação crítica)
            const [closedCommand] = await this.db
                .update(database_1.commands)
                .set({
                status: 'CLOSED',
                cashierClosedAt: new Date(),
                cashierClosedById: currentUser.id,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // === OPERAÇÕES NÃO-CRÍTICAS (não devem derrubar a resposta) ===
            // Atualiza totais do caixa por método de pagamento
            try {
                for (const payment of payments) {
                    await this.cashRegistersService.addSale(command.salonId, payment.method || 'OTHER', parseFloat(payment.netAmount || payment.amount));
                }
            }
            catch (err) {
                console.error('[closeCashier] Erro ao atualizar totais do caixa:', err);
            }
            // Se a comanda tem cliente vinculado, atualiza totalVisits e lastVisitDate
            if (command.clientId) {
                try {
                    await this.clientsService.updateLastVisit(command.clientId);
                }
                catch (err) {
                    console.error('[closeCashier] Erro ao atualizar ultima visita do cliente:', err);
                }
            }
            // Cria comissoes para itens de servico com profissional
            try {
                await this.createCommissionsForCommand(command.salonId, commandId);
            }
            catch (err) {
                console.error('[closeCashier] Erro ao criar comissoes:', err);
            }
            // Processa pontos de fidelidade se cliente vinculado
            let loyaltyPointsEarned = 0;
            let tierUpgraded = false;
            let newTierName;
            if (command.clientId) {
                try {
                    const loyaltyResult = await this.loyaltyService.processCommandPoints(command.salonId, commandId, command.clientId, currentUser.id);
                    loyaltyPointsEarned = loyaltyResult.pointsEarned;
                    tierUpgraded = loyaltyResult.tierUpgraded;
                    newTierName = loyaltyResult.newTierName;
                }
                catch (err) {
                    console.error('[closeCashier] Erro ao processar pontos de fidelidade:', err);
                }
            }
            // Registra evento
            try {
                await this.addEvent(commandId, currentUser.id, 'CASHIER_CLOSED', {
                    totalNet,
                    totalPaid,
                    change: totalPaid - totalNet,
                    clientId: command.clientId,
                    loyaltyPointsEarned,
                    tierUpgraded,
                    newTierName,
                });
            }
            catch (err) {
                console.error('[closeCashier] Erro ao registrar evento:', err);
            }
            return closedCommand;
        }
        /**
         * Cria comissoes para itens de servico da comanda
         */
        async createCommissionsForCommand(salonId, commandId) {
            // Busca todos os itens da comanda
            const items = await this.getItems(commandId);
            // Filtra apenas itens de servico nao cancelados e com profissional
            const serviceItems = items.filter(item => item.type === 'SERVICE' && !item.canceledAt && item.performerId);
            for (const item of serviceItems) {
                // Se o item tem referenceId (ID do servico), busca o commissionPercentage do servico
                let commissionPercentage = 0;
                if (item.referenceId) {
                    const [service] = await this.db
                        .select()
                        .from(database_1.services)
                        .where((0, drizzle_orm_1.eq)(database_1.services.id, parseInt(item.referenceId)))
                        .limit(1);
                    if (service && parseFloat(service.commissionPercentage) > 0) {
                        commissionPercentage = parseFloat(service.commissionPercentage);
                    }
                }
                // Se nao tem servico vinculado ou servico nao tem comissao, usa a comissao do profissional
                if (commissionPercentage === 0 && item.performerId) {
                    const [professional] = await this.db
                        .select()
                        .from(database_1.users)
                        .where((0, drizzle_orm_1.eq)(database_1.users.id, item.performerId))
                        .limit(1);
                    if (professional && professional.commissionRate) {
                        commissionPercentage = parseFloat(professional.commissionRate) * 100;
                    }
                }
                // Cria comissao se houver percentual
                if (commissionPercentage > 0) {
                    await this.commissionsService.createFromCommandItem(salonId, commandId, item.id, item.performerId, item.description, parseFloat(item.totalPrice), commissionPercentage);
                }
            }
        }
        /**
         * Cancela comanda
         */
        async cancel(commandId, reason, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED') {
                throw new common_1.BadRequestException('Comanda ja foi fechada');
            }
            if (command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja foi cancelada');
            }
            // L5 FIX: Devolver estoque de todos os PRODUCTs não cancelados
            const items = await this.getItems(commandId);
            const productItems = items.filter(item => item.type === 'PRODUCT' && !item.canceledAt && item.referenceId);
            for (const item of productItems) {
                try {
                    const productId = parseInt(item.referenceId, 10);
                    if (!isNaN(productId)) {
                        const qty = parseFloat(item.quantity);
                        // Devolver estoque RETAIL (produto vendido)
                        await this.productsService.adjustStockWithLocation({
                            productId,
                            salonId: command.salonId,
                            userId: currentUser.id,
                            quantity: qty, // positivo = entrada (devolução)
                            locationType: 'RETAIL',
                            movementType: 'RETURN',
                            reason: `Cancelamento comanda ${command.cardNumber}`,
                            referenceType: 'command',
                            referenceId: command.id,
                        });
                    }
                }
                catch (err) {
                    console.error(`[cancel] Erro ao devolver estoque do item ${item.id}:`, err);
                    // Continua mesmo se falhar (não bloqueia cancelamento)
                }
            }
            // ========================================
            // PACOTE 3: Reverter BOM se serviços foram encerrados
            // ========================================
            let bomRevertedCount = 0;
            if (command.serviceClosedAt) {
                const serviceItems = items.filter(item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId);
                // Coletar IDs de serviços únicos
                const serviceIds = [];
                for (const item of serviceItems) {
                    const serviceId = parseInt(item.referenceId, 10);
                    if (!isNaN(serviceId) && !serviceIds.includes(serviceId)) {
                        serviceIds.push(serviceId);
                    }
                }
                if (serviceIds.length > 0) {
                    const allConsumptions = await this.serviceConsumptionsService.findByServiceIds(serviceIds, command.salonId);
                    // Agregar consumo por produto (mesma lógica do closeService)
                    const consumptionMap = new Map();
                    for (const item of serviceItems) {
                        const serviceId = parseInt(item.referenceId, 10);
                        if (isNaN(serviceId))
                            continue;
                        const itemQty = parseFloat(item.quantity);
                        const serviceConsumptions = allConsumptions.filter(c => c.serviceId === serviceId);
                        for (const consumption of serviceConsumptions) {
                            const productId = consumption.productId;
                            const bomQty = parseFloat(consumption.quantity);
                            const totalQty = itemQty * bomQty;
                            const current = consumptionMap.get(productId) || 0;
                            consumptionMap.set(productId, current + totalQty);
                        }
                    }
                    // Reverter consumo de estoque INTERNAL (sem try/catch - falha bloqueia cancel)
                    for (const [productId, totalQty] of consumptionMap.entries()) {
                        await this.productsService.adjustStockWithLocation({
                            productId,
                            salonId: command.salonId,
                            userId: currentUser.id,
                            quantity: totalQty, // positivo = entrada (reversão)
                            locationType: 'INTERNAL', // estoque do SALÃO (consumo interno)
                            movementType: 'RETURN',
                            reason: `Cancelamento comanda ${command.cardNumber} - Reversão BOM`,
                            referenceType: 'command',
                            referenceId: command.id,
                        });
                        bomRevertedCount++;
                    }
                }
            }
            // ========================================
            // PACOTE: Reverter sessões de pacotes para itens pagos por pacote
            // ========================================
            let packageSessionsReverted = 0;
            const packageItems = items.filter(item => !item.canceledAt && item.paidByPackage && item.clientPackageUsageId);
            for (const item of packageItems) {
                try {
                    await this.clientPackagesService.revertSession(item.clientPackageUsageId, `Reverted due to command cancellation - Command ${command.cardNumber}${reason ? `: ${reason}` : ''}`);
                    packageSessionsReverted++;
                }
                catch (err) {
                    this.logger.warn(`[cancel] Erro ao reverter sessão do pacote (item ${item.id}): ${err.message}`);
                    // Continua mesmo se falhar
                }
            }
            const [canceledCommand] = await this.db
                .update(database_1.commands)
                .set({
                status: 'CANCELED',
                notes: reason ? `${command.notes || ''}\n[CANCELAMENTO] ${reason}` : command.notes,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'STATUS_CHANGED', {
                from: command.status,
                to: 'CANCELED',
                reason,
                stockReturned: productItems.length,
                bomReverted: bomRevertedCount,
                packageSessionsReverted,
            });
            return canceledCommand;
        }
        /**
         * Vincula cliente à comanda
         */
        async linkClient(commandId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            // Busca dados do cliente para registrar nome no evento
            const client = await this.clientsService.findById(data.clientId);
            if (!client) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            const [updatedCommand] = await this.db
                .update(database_1.commands)
                .set({
                clientId: data.clientId,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento CLIENT_LINKED
            await this.addEvent(commandId, currentUser.id, 'CLIENT_LINKED', {
                clientId: data.clientId,
                clientName: client.name || 'Cliente',
                clientPhone: client.phone,
            });
            return updatedCommand;
        }
        /**
         * Remove vínculo do cliente com a comanda
         */
        async unlinkClient(commandId, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            if (command.status === 'CLOSED' || command.status === 'CANCELED') {
                throw new common_1.BadRequestException('Comanda ja encerrada ou cancelada');
            }
            if (!command.clientId) {
                throw new common_1.BadRequestException('Comanda nao possui cliente vinculado');
            }
            // Busca dados do cliente para registrar nome no evento
            const client = await this.clientsService.findById(command.clientId);
            const clientName = client?.name || 'Cliente';
            const [updatedCommand] = await this.db
                .update(database_1.commands)
                .set({
                clientId: null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento CLIENT_UNLINKED
            await this.addEvent(commandId, currentUser.id, 'CLIENT_UNLINKED', {
                clientId: command.clientId,
                clientName,
            });
            return updatedCommand;
        }
        /**
         * Adiciona nota à comanda
         */
        async addNote(commandId, data, currentUser) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            const newNotes = command.notes
                ? `${command.notes}\n${data.note}`
                : data.note;
            const [updatedCommand] = await this.db
                .update(database_1.commands)
                .set({
                notes: newNotes,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId))
                .returning();
            // Registra evento
            await this.addEvent(commandId, currentUser.id, 'NOTE_ADDED', {
                note: data.note,
            });
            return updatedCommand;
        }
        /**
         * Busca itens da comanda
         */
        async getItems(commandId) {
            return this.db
                .select()
                .from(database_1.commandItems)
                .where((0, drizzle_orm_1.eq)(database_1.commandItems.commandId, commandId))
                .orderBy(database_1.commandItems.addedAt);
        }
        /**
         * Busca pagamentos da comanda
         */
        async getPayments(commandId) {
            return this.db
                .select()
                .from(database_1.commandPayments)
                .where((0, drizzle_orm_1.eq)(database_1.commandPayments.commandId, commandId))
                .orderBy(database_1.commandPayments.paidAt);
        }
        /**
         * Busca eventos/timeline da comanda com nome do usuário
         */
        async getEvents(commandId) {
            const events = await this.db
                .select({
                id: database_1.commandEvents.id,
                commandId: database_1.commandEvents.commandId,
                actorId: database_1.commandEvents.actorId,
                actorName: database_1.users.name,
                eventType: database_1.commandEvents.eventType,
                metadata: database_1.commandEvents.metadata,
                createdAt: database_1.commandEvents.createdAt,
            })
                .from(database_1.commandEvents)
                .leftJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.commandEvents.actorId, database_1.users.id))
                .where((0, drizzle_orm_1.eq)(database_1.commandEvents.commandId, commandId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.commandEvents.createdAt));
            return events;
        }
        /**
         * Busca detalhes completos da comanda
         */
        async getDetails(commandId) {
            const command = await this.findById(commandId);
            if (!command) {
                throw new common_1.NotFoundException('Comanda nao encontrada');
            }
            const [items, payments, events] = await Promise.all([
                this.getItems(commandId),
                this.getPayments(commandId),
                this.getEvents(commandId),
            ]);
            return {
                ...command,
                items,
                payments,
                events,
            };
        }
        /**
         * Gera código sequencial da comanda
         */
        async generateCode(salonId) {
            const today = new Date();
            const prefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
            const todayCommands = await this.db
                .select()
                .from(database_1.commands)
                .where((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId));
            const todayCount = todayCommands.filter((c) => c.code?.startsWith(prefix)).length;
            return `${prefix}-${String(todayCount + 1).padStart(4, '0')}`;
        }
        /**
         * Gera próximo número sequencial da comanda (1-999)
         * Pula números que já estão em uso (comandas não fechadas/canceladas)
         */
        async generateNextNumber(salonId) {
            // Busca números de comandas ABERTAS (não CLOSED, não CANCELED) para saber quais pular
            const openCommands = await this.db
                .select({ cardNumber: database_1.commands.cardNumber })
                .from(database_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.ne)(database_1.commands.status, 'CANCELED')));
            const usedNumbers = new Set(openCommands
                .map(c => parseInt(c.cardNumber, 10))
                .filter(n => !isNaN(n) && n >= 1 && n <= 999));
            // Encontra o próximo número disponível começando de 1
            let nextNumber = 1;
            while (usedNumbers.has(nextNumber) && nextNumber <= 999) {
                nextNumber++;
            }
            if (nextNumber > 999) {
                throw new common_1.BadRequestException('Limite de 999 comandas atingido. Entre em contato com o suporte.');
            }
            return String(nextNumber);
        }
        /**
         * Valida se número de comanda está no range 1-999
         */
        validateCommandNumber(cardNumber) {
            const num = parseInt(cardNumber, 10);
            if (isNaN(num) || num < 1 || num > 999) {
                throw new common_1.BadRequestException('Numero da comanda deve ser entre 1 e 999');
            }
        }
        /**
         * Recalcula totais da comanda
         */
        async recalculateTotals(commandId) {
            const items = await this.db
                .select()
                .from(database_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commandItems.commandId, commandId)));
            // Soma apenas itens não cancelados
            const activeItems = items.filter((i) => !i.canceledAt);
            const totalGross = activeItems.reduce((sum, i) => sum + parseFloat(i.totalPrice), 0);
            const totalDiscounts = activeItems.reduce((sum, i) => sum + parseFloat(i.discount || '0'), 0);
            const totalNet = totalGross;
            await this.db
                .update(database_1.commands)
                .set({
                totalGross: totalGross.toString(),
                totalDiscounts: totalDiscounts.toString(),
                totalNet: totalNet.toString(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, commandId));
        }
        /**
         * Processa consumo automático de produtos da receita (BOM versionado)
         * Chamado ao fechar serviço na comanda - cria snapshots imutáveis para auditoria
         */
        async processRecipeConsumption(args) {
            const { serviceId, salonId, commandId, commandItemId, userId, variantId } = args;
            // 1. IDEMPOTÊNCIA: Verificar se já processou este item
            const existingSnapshots = await this.db
                .select({ id: database_1.commandConsumptionSnapshots.id })
                .from(database_1.commandConsumptionSnapshots)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.commandConsumptionSnapshots.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.commandConsumptionSnapshots.commandId, commandId), (0, drizzle_orm_1.eq)(database_1.commandConsumptionSnapshots.commandItemId, commandItemId)))
                .limit(1);
            if (existingSnapshots.length > 0) {
                this.logger.log(`Consumo já processado para commandItemId: ${commandItemId}, pulando.`);
                return;
            }
            // 2. BUSCAR RECEITA ATIVA
            const recipe = await this.recipesService.getActiveRecipe(serviceId, salonId);
            if (!recipe || recipe.lines.length === 0) {
                // Serviço não tem receita, OK - nada a consumir
                return;
            }
            // 3. RESOLVER VARIAÇÃO (multiplicador)
            let multiplier = 1;
            let variantCode = 'DEFAULT';
            if (variantId) {
                const variant = recipe.variants.find(v => v.id === variantId);
                if (variant) {
                    multiplier = variant.multiplier;
                    variantCode = variant.code;
                }
            }
            else {
                // Usar variação default se existir
                const defaultVariant = recipe.variants.find(v => v.isDefault);
                if (defaultVariant) {
                    multiplier = defaultVariant.multiplier;
                    variantCode = defaultVariant.code;
                }
            }
            // 4. PROCESSAR CADA LINHA DA RECEITA
            for (const line of recipe.lines) {
                try {
                    // Calcular quantidade aplicada
                    const quantityBase = line.quantityStandard + line.quantityBuffer;
                    // Regra de arredondamento:
                    // - UN (unidades): Math.ceil (arredondar para cima)
                    // - ML, G, KG, L (volumetria/peso): manter decimal com 3 casas
                    const quantityApplied = line.unit === 'UN'
                        ? Math.ceil(quantityBase * multiplier)
                        : Math.round((quantityBase * multiplier) * 1000) / 1000;
                    // 5. BAIXAR ESTOQUE INTERNO
                    let stockMovementId = null;
                    try {
                        const result = await this.productsService.adjustStockWithLocation({
                            productId: line.productId,
                            salonId,
                            userId,
                            quantity: -quantityApplied, // Negativo = saída
                            locationType: 'INTERNAL',
                            movementType: 'SERVICE_CONSUMPTION',
                            referenceType: 'command',
                            referenceId: commandId,
                            reason: `Consumo automático - ${recipe.serviceName} [${variantCode}] - Item: ${commandItemId}`,
                        });
                        stockMovementId = result.movement.id;
                    }
                    catch (stockError) {
                        // Logar warning mas NÃO bloquear - continua criando snapshot
                        this.logger.warn(`Erro ao baixar estoque: serviceId=${serviceId}, productId=${line.productId}, ` +
                            `commandId=${commandId}, commandItemId=${commandItemId}, erro=${stockError.message}`);
                        // stockMovementId permanece null
                    }
                    // 6. CRIAR SNAPSHOT (auditoria imutável)
                    await this.db.insert(database_1.commandConsumptionSnapshots).values({
                        salonId,
                        commandId,
                        commandItemId,
                        serviceId,
                        recipeId: recipe.id,
                        recipeVersion: recipe.version,
                        variantCode: variantCode,
                        variantMultiplier: multiplier.toString(),
                        productId: line.productId,
                        productName: line.productName,
                        quantityStandard: line.quantityStandard.toString(),
                        quantityBuffer: line.quantityBuffer.toString(),
                        quantityApplied: quantityApplied.toString(),
                        unit: line.unit,
                        costAtTime: line.productCost.toString(),
                        totalCost: (quantityApplied * line.productCost).toString(),
                        stockMovementId,
                        postedAt: new Date(),
                    });
                }
                catch (error) {
                    // Erro crítico na linha, logar e continuar para próxima
                    this.logger.error(`Erro ao processar linha da receita: serviceId=${serviceId}, ` +
                        `productId=${line.productId}, commandItemId=${commandItemId}`, error.stack);
                    // Continua para próxima linha
                }
            }
        }
        /**
         * Adiciona evento de auditoria
         */
        async addEvent(commandId, actorId, eventType, metadata) {
            await this.db.insert(database_1.commandEvents).values({
                commandId,
                actorId,
                eventType,
                metadata,
            });
        }
    };
    return CommandsService = _classThis;
})();
exports.CommandsService = CommandsService;
//# sourceMappingURL=commands.service.js.map