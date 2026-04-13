<?php
// ============================================================
// EDUCATIONAL VULNERABLE APP — intentionally insecure LFI
// Demonstrates: Local File Inclusion via unsanitised ?path=
// ============================================================

$path = isset($_GET['path']) ? $_GET['path'] : '';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>File Reader — CorpApp</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; margin: 40px; }
        h1 { color: #00d4ff; }
        .hint { color: #888; font-size: 0.85em; }
        .output { background: #0d2137; border-left: 3px solid #ff6b6b;
                  padding: 15px; white-space: pre-wrap; margin-top: 15px; }
        form input[type=text] { background: #0d2137; color: #e0e0e0;
                                 border: 1px solid #444; padding: 5px; width: 400px; }
        form input[type=submit] { background: #ff6b6b; color: #fff;
                                   border: none; padding: 6px 14px; cursor: pointer; }
    </style>
</head>
<body>
<h1>File Reader</h1>
<p class="hint">
    Provide a file path to read its contents.<br>
    Hint: <code>?path=/etc/passwd</code> | <code>?path=/var/www/html/flag.txt</code> |
    <code>?path=/proc/self/environ</code>
</p>

<form method="get">
    <input type="text" name="path" value="<?php echo htmlspecialchars($path, ENT_QUOTES); ?>" placeholder="/etc/passwd">
    <input type="submit" value="Read">
</form>

<?php
// Vulnerable LFI — no path validation whatsoever
if ($path !== '') {
    echo '<div class="output">';
    // include() allows PHP code execution in uploaded files (webshell chain)
    include($path);
    echo '</div>';
}
?>

<p><a href="/" style="color:#00d4ff">← Back to main page</a></p>
</body>
</html>
