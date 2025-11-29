import { describe, it, expect } from 'vitest'
import { validateKeyboardPattern } from '../../src/validators/keyboard-pattern.js'

describe('validateKeyboardPattern', () => {
  describe('QWERTY row patterns', () => {
    it('should reject qwerty pattern', () => {
      const result = validateKeyboardPattern('myqwerty123')
      expect(result.passed).toBe(false)
      expect(result.message).toBe('Password contains common keyboard patterns')
    })

    it('should reject asdfgh pattern', () => {
      const result = validateKeyboardPattern('asdfgh123')
      expect(result.passed).toBe(false)
    })

    it('should reject zxcvbn pattern', () => {
      const result = validateKeyboardPattern('zxcvbn789')
      expect(result.passed).toBe(false)
    })

    it('should reject qwertyuiop pattern', () => {
      const result = validateKeyboardPattern('qwertyuiop')
      expect(result.passed).toBe(false)
    })

    it('should be case-insensitive for QWERTY', () => {
      const result = validateKeyboardPattern('QWERTY123')
      expect(result.passed).toBe(false)
    })

    it('should be case-insensitive for mixed case', () => {
      const result = validateKeyboardPattern('QwErTy123')
      expect(result.passed).toBe(false)
    })
  })

  describe('reverse patterns', () => {
    it('should reject reversed qwerty (ytrewq)', () => {
      const result = validateKeyboardPattern('ytrewq123')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed asdfgh (hgfdsa)', () => {
      const result = validateKeyboardPattern('hgfdsa456')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed zxcvbn (nbvcxz)', () => {
      const result = validateKeyboardPattern('nbvcxz789')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed number sequence (0987654321)', () => {
      const result = validateKeyboardPattern('pass0987654321')
      expect(result.passed).toBe(false)
    })
  })

  describe('column patterns', () => {
    it('should reject 1qaz pattern', () => {
      const result = validateKeyboardPattern('1qaz2wsx')
      expect(result.passed).toBe(false)
    })

    it('should reject 2wsx pattern', () => {
      const result = validateKeyboardPattern('my2wsx')
      expect(result.passed).toBe(false)
    })

    it('should reject 3edc pattern', () => {
      const result = validateKeyboardPattern('3edc4rfv')
      expect(result.passed).toBe(false)
    })

    it('should reject multiple column patterns', () => {
      const result = validateKeyboardPattern('4rfv5tgb')
      expect(result.passed).toBe(false)
    })
  })

  describe('diagonal patterns', () => {
    it('should reject qaz pattern', () => {
      const result = validateKeyboardPattern('qazwsx')
      expect(result.passed).toBe(false)
    })

    it('should reject wsx pattern', () => {
      const result = validateKeyboardPattern('wsxedc')
      expect(result.passed).toBe(false)
    })

    it('should reject zaq pattern (reverse diagonal)', () => {
      const result = validateKeyboardPattern('zaq123')
      expect(result.passed).toBe(false)
    })
  })

  describe('numeric keypad patterns', () => {
    it('should reject 789 pattern', () => {
      const result = validateKeyboardPattern('pass789')
      expect(result.passed).toBe(false)
    })

    it('should reject 456 pattern', () => {
      const result = validateKeyboardPattern('mypass456')
      expect(result.passed).toBe(false)
    })

    it('should reject 123 pattern', () => {
      const result = validateKeyboardPattern('password123')
      expect(result.passed).toBe(false)
    })

    it('should reject vertical keypad patterns 741', () => {
      const result = validateKeyboardPattern('741852')
      expect(result.passed).toBe(false)
    })

    it('should reject vertical keypad patterns 852', () => {
      const result = validateKeyboardPattern('mypass852')
      expect(result.passed).toBe(false)
    })
  })

  describe('short patterns (3 chars)', () => {
    it('should reject qwe pattern', () => {
      const result = validateKeyboardPattern('qwepass')
      expect(result.passed).toBe(false)
    })

    it('should reject asd pattern', () => {
      const result = validateKeyboardPattern('asdpass')
      expect(result.passed).toBe(false)
    })

    it('should reject zxc pattern', () => {
      const result = validateKeyboardPattern('zxcpass')
      expect(result.passed).toBe(false)
    })

    it('should reject poi pattern', () => {
      const result = validateKeyboardPattern('poiuyt')
      expect(result.passed).toBe(false)
    })
  })

  describe('valid passwords (no keyboard patterns)', () => {
    it('should accept password with no patterns', () => {
      const result = validateKeyboardPattern('MyP@ssw0rd!')
      expect(result.passed).toBe(true)
    })

    it('should accept random complex password', () => {
      const result = validateKeyboardPattern('X9#mK2!pL7')
      expect(result.passed).toBe(true)
    })

    it('should accept password with scattered letters', () => {
      const result = validateKeyboardPattern('aQbWcE927')
      expect(result.passed).toBe(true)
    })

    it('should accept password with non-sequential numbers', () => {
      const result = validateKeyboardPattern('pass9284')
      expect(result.passed).toBe(true)
    })

    it('should accept long random password', () => {
      const result = validateKeyboardPattern('Tr0ub4dor&3')
      expect(result.passed).toBe(true)
    })
  })

  describe('options', () => {
    it('should skip check when checkKeyboardPatterns is false', () => {
      const result = validateKeyboardPattern('qwerty123', {
        checkKeyboardPatterns: false,
      })
      expect(result.passed).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('should check by default when no options provided', () => {
      const result = validateKeyboardPattern('qwerty123')
      expect(result.passed).toBe(false)
    })

    it('should check when checkKeyboardPatterns is true', () => {
      const result = validateKeyboardPattern('qwerty123', {
        checkKeyboardPatterns: true,
      })
      expect(result.passed).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty password', () => {
      const result = validateKeyboardPattern('')
      expect(result.passed).toBe(true)
    })

    it('should handle single character', () => {
      const result = validateKeyboardPattern('a')
      expect(result.passed).toBe(true)
    })

    it('should handle two characters', () => {
      const result = validateKeyboardPattern('ab')
      expect(result.passed).toBe(true)
    })

    it('should detect pattern at start', () => {
      const result = validateKeyboardPattern('qwertyMyPassword')
      expect(result.passed).toBe(false)
    })

    it('should detect pattern in middle', () => {
      const result = validateKeyboardPattern('Myqwerty123')
      expect(result.passed).toBe(false)
    })

    it('should detect pattern at end', () => {
      const result = validateKeyboardPattern('MyPasswordqwerty')
      expect(result.passed).toBe(false)
    })

    it('should handle special characters around pattern', () => {
      const result = validateKeyboardPattern('!@#qwerty$%^')
      expect(result.passed).toBe(false)
    })
  })

  describe('pattern combinations', () => {
    it('should reject multiple patterns in one password', () => {
      const result = validateKeyboardPattern('qwerty123asdfgh')
      expect(result.passed).toBe(false)
    })

    it('should reject pattern with numbers', () => {
      const result = validateKeyboardPattern('1234567890pass')
      expect(result.passed).toBe(false)
    })
  })

  describe('AZERTY layout (French, Belgian)', () => {
    it('should reject azerty pattern', () => {
      const result = validateKeyboardPattern('azerty123')
      expect(result.passed).toBe(false)
    })

    it('should reject azertyuiop full row', () => {
      const result = validateKeyboardPattern('myazertyuiop')
      expect(result.passed).toBe(false)
    })

    it('should reject qsdfg pattern', () => {
      const result = validateKeyboardPattern('qsdfg456')
      expect(result.passed).toBe(false)
    })

    it('should reject qsdfghjklm full row', () => {
      const result = validateKeyboardPattern('qsdfghjklm')
      expect(result.passed).toBe(false)
    })

    it('should reject wxcvb pattern', () => {
      const result = validateKeyboardPattern('passwxcvb')
      expect(result.passed).toBe(false)
    })

    it('should be case-insensitive for AZERTY', () => {
      const result = validateKeyboardPattern('AZERTY789')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed azerty (ytreza)', () => {
      const result = validateKeyboardPattern('ytreza123')
      expect(result.passed).toBe(false)
    })
  })

  describe('QWERTZ layout (German, Central European)', () => {
    it('should reject qwertz pattern', () => {
      const result = validateKeyboardPattern('qwertz123')
      expect(result.passed).toBe(false)
    })

    it('should reject qwertzuiop full row', () => {
      const result = validateKeyboardPattern('qwertzuiop')
      expect(result.passed).toBe(false)
    })

    it('should reject yxcvb pattern', () => {
      const result = validateKeyboardPattern('passyxcvb')
      expect(result.passed).toBe(false)
    })

    it('should reject yxcvbnm full row', () => {
      const result = validateKeyboardPattern('yxcvbnm789')
      expect(result.passed).toBe(false)
    })

    it('should be case-insensitive for QWERTZ', () => {
      const result = validateKeyboardPattern('QWERTZ456')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed qwertz (ztrewq)', () => {
      const result = validateKeyboardPattern('ztrewq123')
      expect(result.passed).toBe(false)
    })
  })

  describe('Dvorak layout', () => {
    it('should reject aoeu pattern', () => {
      const result = validateKeyboardPattern('aoeu123')
      expect(result.passed).toBe(false)
    })

    it('should reject aoeuidhtns pattern', () => {
      const result = validateKeyboardPattern('aoeuidhtns')
      expect(result.passed).toBe(false)
    })

    it('should reject pyfgcrl pattern', () => {
      const result = validateKeyboardPattern('pyfgcrl789')
      expect(result.passed).toBe(false)
    })

    it('should reject htns pattern', () => {
      const result = validateKeyboardPattern('passhtns')
      expect(result.passed).toBe(false)
    })

    it('should reject qjkx pattern', () => {
      const result = validateKeyboardPattern('qjkx456')
      expect(result.passed).toBe(false)
    })
  })

  describe('Colemak layout', () => {
    it('should reject arst pattern', () => {
      const result = validateKeyboardPattern('arst123')
      expect(result.passed).toBe(false)
    })

    it('should reject arstdhneio pattern', () => {
      const result = validateKeyboardPattern('arstdhneio')
      expect(result.passed).toBe(false)
    })

    it('should reject qwfpgjluy pattern', () => {
      const result = validateKeyboardPattern('qwfpgjluy789')
      expect(result.passed).toBe(false)
    })

    it('should reject dhne pattern', () => {
      const result = validateKeyboardPattern('passdhne')
      expect(result.passed).toBe(false)
    })
  })

  describe('Cyrillic layout (ЙЦУКЕН - Russian)', () => {
    it('should reject йцукен pattern', () => {
      const result = validateKeyboardPattern('йцукен123')
      expect(result.passed).toBe(false)
    })

    it('should reject фывап pattern', () => {
      const result = validateKeyboardPattern('фывап456')
      expect(result.passed).toBe(false)
    })

    it('should reject ячсми pattern', () => {
      const result = validateKeyboardPattern('passячсми')
      expect(result.passed).toBe(false)
    })

    it('should reject full йцукенгшщзхъ row', () => {
      const result = validateKeyboardPattern('йцукенгшщзхъ')
      expect(result.passed).toBe(false)
    })

    it('should reject full фывапролджэ row', () => {
      const result = validateKeyboardPattern('фывапролджэ')
      expect(result.passed).toBe(false)
    })

    it('should reject reversed йцукен (некуцй)', () => {
      const result = validateKeyboardPattern('некуцй789')
      expect(result.passed).toBe(false)
    })
  })

  describe('multi-layout support', () => {
    it('should reject passwords with QWERTY patterns', () => {
      expect(validateKeyboardPattern('qwerty123').passed).toBe(false)
    })

    it('should reject passwords with AZERTY patterns', () => {
      expect(validateKeyboardPattern('azerty456').passed).toBe(false)
    })

    it('should reject passwords with QWERTZ patterns', () => {
      expect(validateKeyboardPattern('qwertz789').passed).toBe(false)
    })

    it('should reject passwords with Dvorak patterns', () => {
      expect(validateKeyboardPattern('aoeu123').passed).toBe(false)
    })

    it('should reject passwords with Colemak patterns', () => {
      expect(validateKeyboardPattern('arst456').passed).toBe(false)
    })

    it('should reject passwords with Cyrillic patterns', () => {
      expect(validateKeyboardPattern('йцукен789').passed).toBe(false)
    })

    it('should accept password with no patterns from any layout', () => {
      expect(validateKeyboardPattern('R@nd0mP@ss!').passed).toBe(true)
    })
  })
})
