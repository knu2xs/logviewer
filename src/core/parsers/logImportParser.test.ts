import { describe, expect, it } from 'vitest';

import { parseLogImportContent, parseLogImportLine } from './logImportParser';

describe('logImportParser', () => {
  it('parses pipe-delimited lines with second precision', () => {
    const result = parseLogImportLine(
      '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
      1,
      'session-1',
      'sample.log',
    );

    if (!result) {
      throw new Error('Expected parsed row');
    }

    expect(result.lineNumber).toBe(1);
    expect(result.sourceFile).toBe('sample.log');
    expect(result.logger).toBe('Portal.Security');
    expect(result.source).toBe('');
    expect(result.level).toBe('ERROR');
    expect(result.message).toBe('Unable to validate token');
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('parses pipe-delimited lines with millisecond timestamps', () => {
    const result = parseLogImportLine(
      '2026-07-09 10:38:56,927 | everett_attributerules | INFO | Configuration loaded',
      1,
      'session-1',
      'sample.log',
    );

    if (!result) {
      throw new Error('Expected parsed row');
    }

    expect(result.timestamp.getMilliseconds()).toBe(927);
  });

  it('ignores blank lines when parsing single-line input', () => {
    const result = parseLogImportLine('', 5, 'session-1', 'sample.log');

    expect(result).toBeNull();
  });

  it('parses content into rows and errors while ignoring trailing newline noise', () => {
    const result = parseLogImportContent(
      '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token\n',
      'session-1',
      'sample.log',
    );

    expect(result.totalLines).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.sourceFormat).toBe('Python Pipe Delimited');
  });

  it('parses ArcGIS Portal XML lines and captures attributes', () => {
    const result = parseLogImportContent(
      '<Msg time="2026-07-08T13:16:10,748" type="INFO" code="217039" source="Portal" process="39264" thread="1" methodName="" machine="ESRI-AKVMBDOUSN.ESRI.COM" user="" elapsed="0.0" requestID="">Log Service started.</Msg>',
      'session-1',
      'portal.log',
    );

    expect(result.sourceFormat).toBe('ArcGIS Portal');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.logger).toBe('');
    expect(result.rows[0]?.source).toBe('Portal');
    expect(result.rows[0]?.level).toBe('INFO');
    expect(result.rows[0]?.message).toBe('Log Service started.');
    expect(result.rows[0]?.attributes?.code).toBe('217039');
    expect(result.rows[0]?.attributes?.source).toBe('Portal');
  });

  it('parses ArcGIS Server XML lines and captures severe levels', () => {
    const result = parseLogImportContent(
      '<Msg time="2026-04-20T16:10:58,505" type="SEVERE" code="7569" source="Server" process="32012" thread="29" methodName="" machine="ESRI-AKVMBDOUSN.ESRI.COM" user="" elapsed="0.0" requestID="">Service containing process crashed.</Msg>',
      'session-1',
      'server.log',
    );

    expect(result.sourceFormat).toBe('ArcGIS Server');
    expect(result.rows[0]?.level).toBe('SEVERE');
    expect(result.rows[0]?.logger).toBe('');
    expect(result.rows[0]?.source).toBe('Server');
  });

  it('buffers multi-line ArcGIS XML records without treating them as continuation text', () => {
    const result = parseLogImportContent(
      [
        "2026-07-08 15:11:54,323 | Portal.Admin | INFO | Validated hosting server 'https://esri-akvmbdousn.esri.com:6443/arcgis'.",
        "Line 111: Validated hosting server 'https://esri-akvmbdousn.esri.com:6443/arcgis'.",
        '<Msg time="2026-07-08T15:11:54,390" type="FINE" code="207052" source="Portal Admin" process="17924" thread="1" methodName="" machine="ESRI-AKVMBDOUSN.ESRI.COM" user="portaladmin" elapsed="0.0" requestID="9b29acee-ef56-47e2-97af-ee8b89275207">Validated hosting server \'https://esri-akvmbdousn.esri.com:6443/arcgis\'. Validation steps. Step1: ArcGIS Server administration URL \'https://esri-akvmbdousn.esri.com:6443/arcgis\' is accessible.',
        'Step2: Validating hosting server.',
        "Step3: ArcGIS Server 'https://esri-akvmbdousn.esri.com:6443/arcgis' version matches with Portal for ArcGIS.",
        "Step4: Verified that server has an ArcGIS Data Store registered as a managed database '/enterpriseDatabases/AGSDataStore_ds_a5g6ek0x'.",
        "Step5: The server managed database '/enterpriseDatabases/AGSDataStore_ds_a5g6ek0x' validated successfully.",
        'Step6: Validated that the ArcGIS Server site is not in read-only mode.',
        'Step7: Configured missing offlinePackaging helper services with Portal for ArcGIS.',
        'Step8: Restarted OfflinePackaging service in the hosting ArcGIS Server.',
        'Step9: Validated that the publishing tools service of ArcGIS Server site is started.',
        '</Msg>',
      ].join('\n'),
      'session-1',
      'portal.log',
    );

    expect(result.sourceFormat).toBe('ArcGIS Portal');
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.message).toBe(
      "Validated hosting server 'https://esri-akvmbdousn.esri.com:6443/arcgis'.",
    );
    expect(result.rows[1]?.level).toBe('FINE');
    expect(result.rows[1]?.message).toContain(
      'Step9: Validated that the publishing tools service of ArcGIS Server site is started.',
    );
    expect(result.rows[1]?.rawLine).toContain('</Msg>');
  });

  it('detects and parses Tomcat two-line entries', () => {
    const result = parseLogImportContent(
      [
        'Jul 01, 2026 3:30:01 PM org.apache.catalina.startup.VersionLoggerListener log',
        'INFO: Server version name:   Apache Tomcat/10.1.34',
      ].join('\n'),
      'session-1',
      'tomcat.log',
    );

    expect(result.sourceFormat).toBe('Tomcat');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.logger).toBe('org.apache.catalina.startup.VersionLoggerListener');
    expect(result.rows[0]?.source).toBe('log');
    expect(result.rows[0]?.level).toBe('INFO');
    expect(result.rows[0]?.message).toBe('Server version name:   Apache Tomcat/10.1.34');
    expect(result.rows[0]?.hadContinuationLines).toBe(false);
  });

  it('captures multiline Tomcat stack traces in the same parsed entry', () => {
    const result = parseLogImportContent(
      [
        'Jul 01, 2026 3:30:52 PM org.apache.catalina.core.StandardContext listenerStop',
        'SEVERE: Exception sending context destroyed event to listener instance of class [com.esri.discovery.app.DiscoveryContextListener]',
        'java.lang.NullPointerException: Cannot invoke "com.esri.arcgis.discovery.logging.Logger.log(...)" because "com.esri.client.app.statistics.BandWidthUsageTracker.logger" is null',
        '\tat com.esri.client.app.statistics.BandWidthUsageTracker.stopTracking(BandWidthUsageTracker.java:117)',
        'Jul 01, 2026 3:30:52 PM org.apache.catalina.loader.WebappClassLoaderBase clearReferencesThreads',
        'WARNING: The web application [arcgis#rest] appears to have started a thread named [Thread-10] but has failed to stop it.',
      ].join('\n'),
      'session-1',
      'tomcat.log',
    );

    expect(result.sourceFormat).toBe('Tomcat');
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.level).toBe('SEVERE');
    expect(result.rows[0]?.message).toContain('java.lang.NullPointerException');
    expect(result.rows[0]?.message).toContain('BandWidthUsageTracker.stopTracking');
    expect(result.rows[0]?.hadContinuationLines).toBe(false);
    expect(result.rows[1]?.level).toBe('WARNING');
  });

  it('handles empty content without errors', () => {
    const result = parseLogImportContent('', 'session-1', 'sample.log');

    expect(result.totalLines).toBe(0);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('appends continuation lines to the previous message and drops blank lines', () => {
    const result = parseLogImportContent(
      [
        '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
        'Failed to execute (AddAttributeRule).',
        '',
        '2026-07-09 08:15:22,125 | Portal.Security | INFO | Token validation started',
      ].join('\n'),
      'session-1',
      'sample.log',
    );

    expect(result.totalLines).toBe(4);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0]?.message).toBe(
      'Unable to validate token\nFailed to execute (AddAttributeRule).',
    );
  });

  it('marks unrecognized content as unknown format when no lines can be parsed', () => {
    const result = parseLogImportContent(
      ['This is not a supported log line format.', 'Still not matching any known parser.'].join(
        '\n',
      ),
      'session-1',
      'unknown.log',
    );

    expect(result.sourceFormat).toBe('Unknown');
    expect(result.rows).toHaveLength(0);
    expect(result.totalLines).toBe(2);
  });
});
