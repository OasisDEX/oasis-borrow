{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  buildInputs = [ ];
  shellHook = ''
    export PRISMA_MIGRATION_ENGINE_BINARY="$HOME/code/prisma/target/release/migration-engine"
    export PRISMA_QUERY_ENGINE_BINARY="$HOME/code/prisma/target/release/query-engine"
    export PRISMA_INTROSPECTION_ENGINE_BINARY="$HOME/code/prisma/target/release/introspection-engine"
    export PRISMA_FMT_BINARY="$HOME/code/prisma/target/release/migration-engine"
  '';
}
