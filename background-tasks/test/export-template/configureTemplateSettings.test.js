import fse from 'fs-extra';
import configureTemplateSettings from '../../src/export-template/configureTemplateSettings';
import templateConfiguration from '../../src/export-template/templateConfiguration';

jest.mock('../../src/export-template/templateConfiguration', () => jest.fn(() => '{}'));

jest.mock('fs-extra', () => ({
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('configureTemplateSettings', () => {
  it('returns a promise passing through arguments', () => {
    const args = {
      foo: 'bar',
      outputDir: '/dev/null',
      settings: {}, // required in test because its properties are accessed
    };

    return configureTemplateSettings(args)
      .then((result) => {
        expect(result).toEqual(args);
      });
  });

  it('writes the return value of templateConfiguration to the two config files', () => {
    const outputDir = '/dev/null';
    const sequences = [];
    const controls = [];
    const settings = {};
    const imageUrls = {};

    fse.readFile.mockResolvedValueOnce([
      '<script>',
      '  const config = {',
      '    foo: 1234,',
      '  };',
      '</script>',
    ].join('\n'));

    const mockConfig = '{ answer: 42 }';
    templateConfiguration.mockReturnValueOnce(mockConfig);

    return configureTemplateSettings({
      outputDir, sequences, controls, settings, imageUrls,
    })
      .then(() => {
        expect(templateConfiguration).toHaveBeenCalledWith(
          sequences, controls, settings, imageUrls,
        );
        expect(fse.readFile).toHaveBeenCalledTimes(2);
        expect(fse.writeFile).toHaveBeenCalledTimes(2);

        // just make sure some (but not all) of the file content is replaced with the new config:
        [
          '<script>',
          'const config =',
          mockConfig,
          '</script>',
        ].forEach((s) => {
          expect(fse.writeFile).toHaveBeenCalledWith(
            expect.stringContaining(outputDir),
            expect.stringContaining(s),
          );
        });
      });
  });
});
