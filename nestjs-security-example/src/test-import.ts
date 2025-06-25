import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';

// 👇 Importação explícita das entidades
console.log(getMetadataArgsStorage().tables.map(t => (typeof t.target === 'function' ? t.target.name : t.target)));
