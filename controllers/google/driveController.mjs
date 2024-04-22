import driveService from "./driveService.mjs";

async function findFolder(req, res) {
  const { folderName, parentFolderId } = req.body;

  try {
    const folderId = await driveService.findFolder(folderName, parentFolderId);
    res.status(200).json({ folderId });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createFolder(req, res) {
  const { folderName, parentFolderId } = req.body;

  try {
    const newFolderId = await driveService.createFolder(
      folderName,
      parentFolderId
    );
    res.status(201).json({ newFolderId });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function uploadFile(req, res) {
  const { filePath, fileName, parentFolderName, subFolderName } = req.body;

  try {
    const fileId = await driveService.uploadFile(
      filePath,
      fileName,
      parentFolderName,
      subFolderName
    );
    res.status(201).json({ fileId });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { findFolder, createFolder, uploadFile };
