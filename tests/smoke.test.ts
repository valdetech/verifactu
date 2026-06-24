import { expect, test } from 'vitest'
import { VERSION } from '../src/index.js'

test('paquete expone versión', () => {
  expect(VERSION).toBe('0.1.0')
})
