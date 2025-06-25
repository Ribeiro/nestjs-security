"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDITABLE = void 0;
exports.Auditable = Auditable;
exports.isAuditable = isAuditable;
require("reflect-metadata");
exports.AUDITABLE = 'audit:auditable';
function Auditable() {
    return target => Reflect.defineMetadata(exports.AUDITABLE, true, target);
}
function isAuditable(entity) {
    return entity && Reflect.getMetadata(exports.AUDITABLE, entity.constructor);
}
