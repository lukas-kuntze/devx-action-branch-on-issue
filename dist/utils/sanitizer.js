"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUmlauts = convertUmlauts;
exports.truncateToMaxLength = truncateToMaxLength;
exports.sanitizeBranchName = sanitizeBranchName;
const core = __importStar(require("@actions/core"));
/**
 * Mapping of German umlauts and special characters to their ASCII equivalents.
 */
const UMLAUT_MAP = {
    ä: 'ae',
    ö: 'oe',
    ü: 'ue',
    ß: 'ss',
    Ä: 'Ae',
    Ö: 'Oe',
    Ü: 'Ue'
};
/**
 * Converts German umlauts and special characters to their ASCII equivalents.
 *
 * @param text - Text containing potential umlauts
 * @returns Text with umlauts converted to ASCII equivalents
 *
 * @example
 * ```typescript
 * convertUmlauts('Größe ändern') // Returns: 'Groesse aendern'
 * convertUmlauts('Übersicht für Benutzer') // Returns: 'Uebersicht fuer Benutzer'
 * ```
 */
function convertUmlauts(text) {
    let result = text;
    for (const [umlaut, replacement] of Object.entries(UMLAUT_MAP)) {
        result = result.replace(new RegExp(umlaut, 'g'), replacement);
    }
    return result;
}
/**
 * Truncates a string to the specified maximum length.
 * Ensures the result does not end with a hyphen.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum allowed length
 * @returns Truncated text without trailing hyphens
 *
 * @example
 * ```typescript
 * truncateToMaxLength('very-long-branch-name', 10) // Returns: 'very-long'
 * ```
 */
function truncateToMaxLength(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    let truncated = text.substring(0, maxLength);
    while (truncated.endsWith('-') && truncated.length > 0) {
        truncated = truncated.substring(0, truncated.length - 1);
    }
    return truncated;
}
/**
 * Sanitizes a text string to create a valid Git branch name.
 *
 * The function performs the following transformations:
 * 1. Converts German umlauts and special characters to ASCII equivalents (ä→ae, ö→oe, ü→ue, ß→ss)
 * 2. Converts to lowercase
 * 3. Replaces spaces and underscores with hyphens
 * 4. Removes all characters except alphanumeric, hyphens, and forward slashes
 * 5. Reduces multiple consecutive hyphens to a single hyphen
 * 6. Removes leading and trailing hyphens
 * 7. Adds optional prefix (with or without label prefix)
 * 8. Truncates to maximum length
 *
 * @param text - Text to sanitize (typically an issue title)
 * @param config - Sanitization configuration
 * @returns Sanitized branch name
 *
 * @example
 * ```typescript
 * const config = { maxLength: 100, prefix: '', useLabelPrefix: false };
 * sanitizeBranchName('FEAT-789 Neue Suchfunktion für Übersicht', config)
 * // Returns: 'feat-789-neue-suchfunktion-fuer-uebersicht'
 *
 * sanitizeBranchName('Feature: Neue Übersicht für Benutzer', config)
 * // Returns: 'feature-neue-uebersicht-fuer-benutzer'
 * ```
 */
function sanitizeBranchName(text, config) {
    core.debug(`Sanitizing branch name from text: "${text}"`);
    let sanitized = convertUmlauts(text);
    core.debug(`After umlaut conversion: "${sanitized}"`);
    sanitized = sanitized.toLowerCase();
    sanitized = sanitized.replace(/[\s_]+/g, '-');
    sanitized = sanitized.replace(/[^a-z0-9\-/]/g, '');
    sanitized = sanitized.replace(/-+/g, '-');
    sanitized = sanitized.replace(/^-+|-+$/g, '');
    core.debug(`After sanitization: "${sanitized}"`);
    let finalName = sanitized;
    if (config.useLabelPrefix && config.labelPrefix) {
        const sanitizedLabelPrefix = sanitizeLabelPrefix(config.labelPrefix);
        finalName = `${sanitizedLabelPrefix}/${sanitized}`;
        core.debug(`Added label prefix: "${finalName}"`);
    }
    else if (config.prefix) {
        const sanitizedPrefix = sanitizeLabelPrefix(config.prefix);
        finalName = `${sanitizedPrefix}/${sanitized}`;
        core.debug(`Added custom prefix: "${finalName}"`);
    }
    if (finalName.length > config.maxLength) {
        finalName = truncateToMaxLength(finalName, config.maxLength);
        core.debug(`Truncated to max length (${config.maxLength}): "${finalName}"`);
    }
    core.info(`Sanitized branch name: "${finalName}"`);
    return finalName;
}
/**
 * Sanitizes a label or prefix string for use in branch names.
 * Converts to lowercase and removes invalid characters.
 *
 * @param prefix - Prefix string to sanitize
 * @returns Sanitized prefix
 *
 * @example
 * ```typescript
 * sanitizeLabelPrefix('Feature Request') // Returns: 'feature-request'
 * sanitizeLabelPrefix('bug/fix') // Returns: 'bug-fix'
 * ```
 */
function sanitizeLabelPrefix(prefix) {
    return prefix
        .toLowerCase()
        .replace(/[\s_/]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}
//# sourceMappingURL=sanitizer.js.map