<?php
declare(strict_types=1);
// Verify the published double-ZIP against its matching Update Assistant XML.
[$script, $archive, $checksum] = $argv;
$outer = new ZipArchive();
if ($outer->open($archive) !== true) throw new RuntimeException('Invalid outer ZIP');
$temporary = tempnam(sys_get_temp_dir(), 'presta-verify-');
try {
    $innerBytes = $outer->getFromName('prestashop.zip');
    if ($innerBytes === false) throw new RuntimeException('Missing inner ZIP');
    file_put_contents($temporary, $innerBytes);
    $zip = new ZipArchive();
    if ($zip->open($temporary) !== true) throw new RuntimeException('Invalid inner ZIP');
    $xml = simplexml_load_file($checksum);
    if ((string) $xml->ps_root_dir['version'] !== '9.2.0') throw new RuntimeException('Wrong version');
    $paths = [];
    $walk = function ($node, string $prefix) use (&$walk, &$paths, $zip): void {
        foreach ($node->children() as $child) {
            $path = $prefix . (string) $child['name'];
            if ($child->getName() === 'dir') { $walk($child, $path . '/'); continue; }
            $bytes = $zip->getFromName($path);
            if ($bytes === false || md5($bytes) !== (string) $child) throw new RuntimeException('Checksum mismatch: ' . $path);
            $paths[$path] = true;
        }
    };
    $walk($xml->ps_root_dir, '');
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (str_starts_with($name, 'modules/ps_onepagecheckout/')) throw new RuntimeException('OPC included');
        if (!str_ends_with($name, '/') && !isset($paths[$name])) throw new RuntimeException('Unlisted file: ' . $name);
    }
    foreach (['app/config/parameters.php', 'config/settings.inc.php', '.env.local', 'local-access.txt'] as $secret) {
        if ($zip->locateName($secret) !== false) throw new RuntimeException('Installed/private file: ' . $secret);
    }
    foreach (['composer.json', 'composer.lock', 'vendor/composer/installed.json', 'vendor/composer/autoload_classmap.php'] as $file) {
        if (stripos($zip->getFromName($file), 'ps_onepagecheckout') !== false) throw new RuntimeException('OPC reference in ' . $file);
    }
    echo 'Verified ZIP/XML: ' . count($paths) . " files; no OPC package, autoload or local configuration.\n";
    $zip->close();
} finally {
    unlink($temporary);
    $outer->close();
}
