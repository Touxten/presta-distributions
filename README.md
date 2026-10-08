# presta.zip — distributions communautaires

Catalogue indépendant de compilations PrestaShop. Non affilié à PrestaShop.

Les archives ZIP et les fichiers XML sont disponibles dans les Releases de ce
dépôt. Les archives sont compilées à partir du dépôt officiel PrestaShop, au tag
correspondant à chaque version. Le fichier `manifests/releases.json` répertorie
leurs tailles, leurs empreintes SHA-256 et les références du code source.

## Vérifier un téléchargement

Télécharger le ZIP et SHA256SUMS depuis la même release, calculer son SHA-256
avec `sha256sum fichier.zip` (Linux), `shasum -a 256 fichier.zip` (macOS), ou
`Get-FileHash fichier.zip -Algorithm SHA256` (PowerShell), puis comparer.
Le XML est destiné à Update Assistant ; ce n'est pas une signature du ZIP.
Les empreintes ne sont pas signées. Une compromission du compte GitHub pourrait
permettre de remplacer à la fois une archive et son empreinte.

Les anciennes versions ne sont pas nécessairement sûres pour la production.
Effectuer une sauvegarde et tester toute mise à jour sur une boutique de test.

## Sources et compilation

Sources amont : https://github.com/PrestaShop/PrestaShop

La page historique indique utiliser l'outil `tools/build/CreateRelease.php` de
PrestaShop. Consulter son README au tag correspondant pour les prérequis :
https://github.com/PrestaShop/PrestaShop/tree/9.2.0/tools/build

Les anciens chemins `/zip/` sont conservés sur le serveur pour les liens existants.
