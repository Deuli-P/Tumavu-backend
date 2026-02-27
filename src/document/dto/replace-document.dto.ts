import { IsString, MinLength } from 'class-validator';

// Remplacer un document : supprime l'ancien et crée un nouveau slug.
export class ReplaceDocumentDto {
  @IsString()
  @MinLength(1)
  slug!: string;
}
