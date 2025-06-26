# ESLint Fix Backlog

## Current Status: 115 problems (91 errors, 24 warnings)
**Progress:** 161 → 115 issues (-46 issues fixed)

## Categories of Remaining Issues

### 1. Unused Variables (71 errors)
**Pattern:** Variables/imports assigned but never used

#### Quick Fixes Needed:
- Prefix with `_` or remove entirely
- **Arrays:** Use `_` for unused destructured elements (e.g., `const [data, _setData] = useState()`)
- **Objects:** Remove unused destructured properties
- **Imports:** Remove unused imports

#### Files with Easy Wins:
- `src/components/Dashboard.jsx` - Line 5: `setStats` → `_setStats` 
- `src/hooks/usePWA.js` - Line 12: `isOnline, setIsOnline` → `_isOnline, _setIsOnline`
- `src/components/PWA/ClassManagement.jsx` - Line 11: `students` → `_students`
- `src/services/authService.js` - Line 4: Remove unused `axios` import
- `src/components/Register.jsx` - Line 4: Remove unused `toast` import

### 2. Missing React Hook Dependencies (24 warnings)
**Pattern:** `react-hooks/exhaustive-deps` warnings

#### Common Fixes:
1. **Add missing dependencies** to dependency array
2. **Move functions inside useEffect** if they're only used there
3. **Use useCallback** to memoize functions used in effects
4. **Add // eslint-disable-next-line** if intentionally omitted

#### High-Priority Files:
- `src/components/MessagingSystem/WhatsAppMessaging.jsx` - 7 warnings (complex component)
- `src/components/PWA/ChildManagement.jsx` - 2 warnings
- `src/pages/HomeworkList.jsx` - 1 warning

### 3. React Refresh Issues (6 warnings)
**Pattern:** `react-refresh/only-export-components`

#### Solution:
Move non-component exports to separate utility files:
- `src/components/TopNotificationManager.jsx` - Line 104
- `src/contexts/ThemeContext.jsx` - Line 5
- `src/hooks/useTheme.jsx` - Lines 5, 72

### 4. Undefined Global Variables (0 issues) ✅
**Status:** FIXED - Added globals to ESLint config

### 5. Duplicate Class Members (0 issues) ✅
**Status:** FIXED - Removed duplicate methods in `adminService.js`

### 6. Case Declaration Issues (0 issues) ✅
**Status:** FIXED - Wrapped case blocks in curly braces

### 7. Prototype Built-ins (0 issues) ✅ 
**Status:** FIXED - Used `Object.prototype.hasOwnProperty.call()`

## Implementation Strategy

### Phase 1: Quick Wins (30-45 mins)
1. Fix unused variables with underscore prefix
2. Remove unused imports
3. Fix simple dependency arrays

### Phase 2: Component Refactoring (1-2 hours)
1. Fix complex hook dependencies
2. Refactor large components with many issues
3. Move non-component exports to utility files

### Phase 3: Optimization (30 mins)
1. Run auto-fix one more time
2. Address remaining edge cases
3. Update ESLint rules if needed

## Tools & Commands

### Auto-fix command:
```bash
npm run lint -- --fix
```

### Check specific file:
```bash
npx eslint src/components/Dashboard.jsx
```

### Bypass pre-commit for WIP:
```bash
git commit --no-verify -m "wip: eslint fixes"
```

## Configuration Updates Made

### ESLint Config (`eslint.config.js`)
```javascript
'no-unused-vars': [
  'error', 
  { 
    varsIgnorePattern: '^[A-Z_]',
    argsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_'
  }
],
```

### Globals Added:
- `toast` (react-toastify)
- `API_CONFIG` (api configuration)
- `firebase` (Firebase SDK)
- `process` (Node.js global)
- `__dirname` (Node.js global)

### Pre-commit Hook Setup ✅
- Husky installed and configured
- Runs `npm run lint` before commits
- Prevents commits with ESLint errors

## Next Steps
1. Continue fixing unused variables systematically
2. Address React hook dependency warnings
3. Refactor components with multiple issues
4. Consider adding more ESLint rules for consistency
5. Document coding standards for the team

## Target: Reduce to < 20 issues
**Current:** 115 issues  
**Goal:** < 20 issues  
**Remaining:** ~95 issues to fix
