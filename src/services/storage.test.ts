/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveFile, getFile, listFileNames, deleteFile, clearStorage } from './storage';

describe('Library Storage Service', () => {
  const testFileName = 'test-song.gp5';
  const testFileData = new Blob(['dummy content'], { type: 'application/octet-stream' });

  beforeEach(async () => {
    await clearStorage();
  });

  afterEach(async () => {
    await clearStorage();
  });

  it('should save and retrieve a file', async () => {
    await saveFile(testFileName, testFileData);
    const retrieved = await getFile(testFileName);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.size).toBe(testFileData.size);
    expect(retrieved?.type).toBe(testFileData.type);
    
    const text = await retrieved?.text();
    expect(text).toBe('dummy content');
  });

  it('should return null for non-existent file', async () => {
    const retrieved = await getFile('not-found.gp5');
    expect(retrieved).toBeNull();
  });

  it('should list all stored file names', async () => {
    await saveFile('song1.gp5', testFileData);
    await saveFile('song2.gp5', testFileData);
    
    const list = await listFileNames();
    expect(list).toContain('song1.gp5');
    expect(list).toContain('song2.gp5');
    expect(list.length).toBe(2);
  });

  it('should delete a file', async () => {
    await saveFile(testFileName, testFileData);
    await deleteFile(testFileName);
    
    const retrieved = await getFile(testFileName);
    expect(retrieved).toBeNull();
    
    const list = await listFileNames();
    expect(list).not.toContain(testFileName);
  });
});
