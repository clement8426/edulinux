<?php
// ============================================================
// EDUCATIONAL VULNERABLE APP — intentionally insecure
// DO NOT deploy outside of isolated lab environments
// ============================================================

// SQLi: ?id= parameter passed directly into query (no sanitisation)
$id = isset($_GET['id']) ? $_GET['id'] : null;
$sql_result = '';
if ($id !== null) {
    // Simulate a vulnerable query (no real DB needed — demonstrates the pattern)
    // In a real SQLi lab backed by MySQL this would be:
    // $pdo = new PDO("mysql:host=db;dbname=app", "user", "pass");
    // $res = $pdo->query("SELECT * FROM users WHERE id = $id");
    $sql_result = '<div class="vuln-output"><strong>SQL query executed:</strong><br>'
        . htmlspecialchars("SELECT * FROM users WHERE id = $id", ENT_QUOTES)
        . '<br><em>(If a real DB were present this would be exploitable via UNION/error injection)</em></div>';
}

// LFI: ?file= parameter included directly (path traversal / LFI)
$file = isset($_GET['file']) ? $_GET['file'] : null;
$lfi_result = '';
if ($file !== null) {
    $target = $file; // No sanitisation — intentional vulnerability
    ob_start();
    // Use include only when the path looks like a traversal attempt or local path
    if (file_exists($target)) {
        include($target);
    } else {
        echo "File not found: " . htmlspecialchars($target, ENT_QUOTES);
    }
    $lfi_result = '<div class="vuln-output"><strong>LFI output for:</strong> '
        . htmlspecialchars($target, ENT_QUOTES) . '<br>'
        . nl2br(htmlspecialchars(ob_get_clean(), ENT_QUOTES))
        . '</div>';
    ob_end_clean();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CorpApp v1.0 — Internal Portal</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; margin: 40px; }
        h1 { color: #00d4ff; }
        h2 { color: #ff6b6b; margin-top: 30px; }
        a { color: #00d4ff; }
        .vuln-output { background: #0d2137; border-left: 3px solid #ff6b6b;
                        padding: 10px; margin: 10px 0; white-space: pre-wrap; }
        .hint { color: #888; font-size: 0.85em; }
        form { margin: 10px 0; }
        input[type=text] { background: #0d2137; color: #e0e0e0; border: 1px solid #444;
                            padding: 5px; width: 300px; }
        input[type=submit] { background: #ff6b6b; color: #fff; border: none;
                              padding: 6px 14px; cursor: pointer; }
    </style>
</head>
<body>
<h1>CorpApp v1.0 — Internal Portal</h1>
<p class="hint">Running on PHP <?php echo phpversion(); ?> | Server: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Apache'; ?></p>

<hr>

<!-- SQLi vector -->
<h2>User Lookup</h2>
<p class="hint">Hint: try <code>?id=1</code>, <code>?id=1 OR 1=1--</code>, <code>?id=1 UNION SELECT 1,2,3--</code></p>
<form method="get">
    <input type="text" name="id" value="<?php echo htmlspecialchars($id ?? '', ENT_QUOTES); ?>" placeholder="User ID">
    <input type="submit" value="Lookup">
</form>
<?php if ($sql_result) echo $sql_result; ?>

<hr>

<!-- LFI vector -->
<h2>File Viewer</h2>
<p class="hint">Hint: try <code>?file=/etc/passwd</code>, <code>?file=../../etc/shadow</code>,
    <code>?file=/var/www/html/flag.txt</code></p>
<form method="get">
    <input type="text" name="file" value="<?php echo htmlspecialchars($file ?? '', ENT_QUOTES); ?>" placeholder="/etc/passwd">
    <input type="submit" value="Read File">
</form>
<?php if ($lfi_result) echo $lfi_result; ?>

<hr>

<h2>Other Endpoints</h2>
<ul>
    <li><a href="/upload.php">File Upload</a> — upload files to the server</li>
    <li><a href="/read.php">Read File (raw LFI)</a> — raw path include</li>
    <li><a href="/robots.txt">robots.txt</a> — recon hint</li>
    <li><a href="/backup/">Backup directory</a> — check for directory listing</li>
</ul>

</body>
</html>
