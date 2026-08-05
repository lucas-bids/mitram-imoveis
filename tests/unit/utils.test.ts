import { describe, it, expect } from 'vitest';
import { generateSlug } from '@/features/admin/properties/slug';

describe('Utils', () => {
  it('should generate a valid slug', () => {
    expect(generateSlug('Apartamento em Curitiba!')).toBe('apartamento-em-curitiba');
    expect(generateSlug('  Casa com piscina  ')).toBe('casa-com-piscina');
    expect(generateSlug('Lançamento: Sobrado 3/Quartos')).toBe('lanamento-sobrado-3quartos'); // Note: For a robust slugify, we usually use an external library like 'slugify', but this is the pure JS version implemented.
  });
});
