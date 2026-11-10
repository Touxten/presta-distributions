# Rapport de tests de PrestaShop 9.1.6 communautaire

Le 10 novembre 2026, la campagne a porté sur les changements entre la version officielle 9.1.5 et le tag communautaire `v9.1.6` du fork Touxten, commit `db91ce15cf`. [Comparer les sources](https://github.com/Touxten/PrestaShop/compare/aee413eedd5fdc5053f28fb998da4b7e286cf641...v9.1.6)

## Vérifications en préproduction

| Contrôle | Résultat observé |
| --- | --- |
| SVG | Le validateur accepte un SVG simple et refuse un SVG contenant un gestionnaire d’événement ou une entité externe. Pour un SVG inoffensif servi en HTTPS, les en-têtes imposent le blocage des scripts par CSP, le téléchargement en pièce jointe et `nosniff`. |
| Imports et archives | Le détecteur accepte un CSV et reconnaît une signature PHAR déguisée. L’extracteur ouvre un ZIP valide et rejette une entrée `../escape.txt`. |
| Cookie de débogage | Le validateur accepte une valeur simple et refuse une apostrophe. |
| Webservice | Une clé limitée à la lecture des produits obtient HTTP 200 sur les produits et HTTP 401 sur les clients. |
| API d’administration | L’API refuse l’accès à une ressource sans le droit requis (403) et l’attribution d’un droit supplémentaire (422). Après désactivation du client, elle refuse le jeton existant et toute nouvelle demande de jeton (401). |

La préproduction possède une seule boutique. Sur cet hôte, les contrôles avec une deuxième boutique ont utilisé une simulation en mémoire. Les fichiers temporaires ont été supprimés et la maintenance a été confirmée active.

### Concordance avec le ZIP publié

Les empreintes SHA-256 des **55 fichiers déployés contrôlés** correspondent au ZIP 9.1.6, y compris le JavaScript compilé du back-office, le webservice et `composer.lock`. Les versions déclarées par Composer pour les **44 dépendances d’exécution ajoutées ou mises à jour** correspondent au verrou du tag. Le fonctionnement de chaque module en boutique reste à valider.

## Tests isolés sur le tag publié

Les scénarios ont utilisé PHP 8.3.36 et une base MySQL 8.0.46 réservée aux tests.

### PHPUnit

**759 tests réussis et 1 028 assertions** sur les 25 classes de test modifiées par le rétroportage. Le résultat final comprend 721 tests unitaires et 38 tests d’intégration, sans échec, erreur ou test ignoré. PHPUnit et certaines dépendances émettent des avis de dépréciation. Lors du premier essai API, un jeu de données manquait. Après sa génération, les huit tests API ont réussi.

Les contrôles couvrent notamment les jetons de réinitialisation client et employé, les traductions, les pièces jointes, l’accès aux fichiers de personnalisation, les archives de thèmes et de modules, les imports PHAR, les SVG et le débogage. Plusieurs classes comprennent également des tests de régression préexistants.

Les tests d’intégration vérifient le verrou par panier et son relâchement, la réservation du dernier bon disponible et sa restitution en cas d’échec. Pour l’installateur, trois tests unitaires portent sur le détecteur d’état. **La réinstallation et l’exploitation du cookie de l’installateur restent non testées.**

### Behat

| Domaine | Scénarios réussis | Étapes réussies |
| --- | ---: | ---: |
| Commandes depuis le back-office, y compris l’ordre des messages créés dans la même seconde | 33 | 642 |
| Quantités des règles panier | 7 | 119 |
| Portée multiboutique du webservice sur les boutiques de test | 6 | 191 |
| Droits des clients API | 11 | 87 |
| **Total** | **57** | **1 039** |

### Grille du back-office

Quatre gestes ont été vérifiés dans Chrome sur une grille utilisant le composant du tag. Un clic ouvre la ligne. Un glissement depuis la poignée ou depuis la cellule laisse la ligne fermée. Le clic suivant ouvre à nouveau la ligne.

## Limites de la campagne

La campagne ne couvre ni les essais de charge, ni une recette exhaustive des modules tiers, ni le parcours de paiement réel.
