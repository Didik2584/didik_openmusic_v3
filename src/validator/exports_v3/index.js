const ExportNotes_v3_PayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator_v3 = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportNotes_v3_PayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator_v3;
