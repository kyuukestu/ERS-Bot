export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      badge_variant_issuers: {
        Row: {
          badge_variant_id: string | null
          character_id: string | null
          end_date: string | null
          id: string
          start_date: string | null
        }
        Insert: {
          badge_variant_id?: string | null
          character_id?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
        }
        Update: {
          badge_variant_id?: string | null
          character_id?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_variant_issuers_badge_variant_id_fkey"
            columns: ["badge_variant_id"]
            isOneToOne: false
            referencedRelation: "badge_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_variant_issuers_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_variant_issuers_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_variants: {
        Row: {
          badge_id: string | null
          id: string
          image_url: string | null
          introduce_date: string | null
          name: string | null
          retired_date: string | null
        }
        Insert: {
          badge_id?: string | null
          id: string
          image_url?: string | null
          introduce_date?: string | null
          name?: string | null
          retired_date?: string | null
        }
        Update: {
          badge_id?: string | null
          id?: string
          image_url?: string | null
          introduce_date?: string | null
          name?: string | null
          retired_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_variants_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "gym_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      bracket_participants: {
        Row: {
          bracket_id: string | null
          character_id: string | null
          elimination_round: number | null
          id: string
          notes: string | null
          seed: number | null
          status: string | null
        }
        Insert: {
          bracket_id?: string | null
          character_id?: string | null
          elimination_round?: number | null
          id?: string
          notes?: string | null
          seed?: number | null
          status?: string | null
        }
        Update: {
          bracket_id?: string | null
          character_id?: string | null
          elimination_round?: number | null
          id?: string
          notes?: string | null
          seed?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bracket_participants_bracket_id_fkey"
            columns: ["bracket_id"]
            isOneToOne: false
            referencedRelation: "event_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bracket_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bracket_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_badges: {
        Row: {
          awarded_by_character_id: string | null
          badge_variant_id: string | null
          character_id: string | null
          id: string
          obtained_date: string | null
        }
        Insert: {
          awarded_by_character_id?: string | null
          badge_variant_id?: string | null
          character_id?: string | null
          id?: string
          obtained_date?: string | null
        }
        Update: {
          awarded_by_character_id?: string | null
          badge_variant_id?: string | null
          character_id?: string | null
          id?: string
          obtained_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_badges_awarded_by_character_id_fkey"
            columns: ["awarded_by_character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_badges_awarded_by_character_id_fkey"
            columns: ["awarded_by_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_badges_badge_variant_id_fkey"
            columns: ["badge_variant_id"]
            isOneToOne: false
            referencedRelation: "badge_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_badges_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_badges_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_classes: {
        Row: {
          character_id: string
          class_id: string
          is_primary: boolean | null
        }
        Insert: {
          character_id: string
          class_id: string
          is_primary?: boolean | null
        }
        Update: {
          character_id?: string
          class_id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "character_classes_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_classes_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "trainer_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      character_organization_roles: {
        Row: {
          character_id: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          role_id: string | null
          start_date: string | null
          status: string
        }
        Insert: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          role_id?: string | null
          start_date?: string | null
          status: string
        }
        Update: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          role_id?: string | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_organization_roles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_organization_roles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      character_parties: {
        Row: {
          character_id: string | null
          event_id: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          character_id?: string | null
          event_id?: string | null
          id: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          character_id?: string | null
          event_id?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_parties_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_parties_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_party_members: {
        Row: {
          party_id: string
          pokemon_id: string | null
          slot_index: number
        }
        Insert: {
          party_id: string
          pokemon_id?: string | null
          slot_index: number
        }
        Update: {
          party_id?: string
          pokemon_id?: string | null
          slot_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "character_party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "character_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_party_members_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_party_members_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon_dashboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      character_rankings: {
        Row: {
          character_id: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          ranking_tier_id: string | null
          start_date: string | null
        }
        Insert: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          ranking_tier_id?: string | null
          start_date?: string | null
        }
        Update: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          ranking_tier_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_rankings_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_rankings_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_rankings_ranking_tier_id_fkey"
            columns: ["ranking_tier_id"]
            isOneToOne: false
            referencedRelation: "ranking_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      character_ribbons: {
        Row: {
          character_id: string | null
          id: string
          obtained_date: string | null
          ribbon_id: string | null
        }
        Insert: {
          character_id?: string | null
          id?: string
          obtained_date?: string | null
          ribbon_id?: string | null
        }
        Update: {
          character_id?: string | null
          id?: string
          obtained_date?: string | null
          ribbon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_ribbons_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_ribbons_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_ribbons_ribbon_id_fkey"
            columns: ["ribbon_id"]
            isOneToOne: false
            referencedRelation: "ribbons"
            referencedColumns: ["id"]
          },
        ]
      }
      character_titles: {
        Row: {
          awarded_date: string | null
          character_id: string | null
          id: string
          is_featured: boolean | null
          title: string
        }
        Insert: {
          awarded_date?: string | null
          character_id?: string | null
          id?: string
          is_featured?: boolean | null
          title: string
        }
        Update: {
          awarded_date?: string | null
          character_id?: string | null
          id?: string
          is_featured?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_titles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_titles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: number | null
          category: string
          color: string | null
          current_region_id: string | null
          dob: string | null
          external_sheet_url: string | null
          full_name: string
          gender: string | null
          height: string | null
          id: string
          image_src: string | null
          image_type: string | null
          nicknames: Json | null
          origin_region_id: string | null
          short_names: Json | null
          slug: string | null
          summary: string | null
        }
        Insert: {
          age?: number | null
          category: string
          color?: string | null
          current_region_id?: string | null
          dob?: string | null
          external_sheet_url?: string | null
          full_name: string
          gender?: string | null
          height?: string | null
          id?: string
          image_src?: string | null
          image_type?: string | null
          nicknames?: Json | null
          origin_region_id?: string | null
          short_names?: Json | null
          slug?: string | null
          summary?: string | null
        }
        Update: {
          age?: number | null
          category?: string
          color?: string | null
          current_region_id?: string | null
          dob?: string | null
          external_sheet_url?: string | null
          full_name?: string
          gender?: string | null
          height?: string | null
          id?: string
          image_src?: string | null
          image_type?: string | null
          nicknames?: Json | null
          origin_region_id?: string | null
          short_names?: Json | null
          slug?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_current_region_id_fkey"
            columns: ["current_region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "characters_current_region_id_fkey"
            columns: ["current_region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "characters_current_region_id_fkey"
            columns: ["current_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_origin_region_id_fkey"
            columns: ["origin_region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "characters_origin_region_id_fkey"
            columns: ["origin_region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "characters_origin_region_id_fkey"
            columns: ["origin_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_brackets: {
        Row: {
          description: string | null
          event_instance_id: string | null
          id: string
          name: string | null
          type: string | null
        }
        Insert: {
          description?: string | null
          event_instance_id?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Update: {
          description?: string | null
          event_instance_id?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_brackets_event_instance_id_fkey"
            columns: ["event_instance_id"]
            isOneToOne: false
            referencedRelation: "event_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      event_definitions: {
        Row: {
          category: string | null
          description: string | null
          id: string
          region_id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id: string
          region_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          region_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_definitions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "event_definitions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "event_definitions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_instances: {
        Row: {
          end_date: string | null
          event_definition_id: string | null
          id: string
          location: string | null
          start_date: string | null
          status: string | null
          thread_url: string | null
          title: string | null
        }
        Insert: {
          end_date?: string | null
          event_definition_id?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: string | null
          thread_url?: string | null
          title?: string | null
        }
        Update: {
          end_date?: string | null
          event_definition_id?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: string | null
          thread_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_instances_event_definition_id_fkey"
            columns: ["event_definition_id"]
            isOneToOne: false
            referencedRelation: "event_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          character_id: string | null
          event_instance_id: string | null
          exited_at: string | null
          id: string
          joined_at: string | null
          result: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          character_id?: string | null
          event_instance_id?: string | null
          exited_at?: string | null
          id?: string
          joined_at?: string | null
          result?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          character_id?: string | null
          event_instance_id?: string | null
          exited_at?: string | null
          id?: string
          joined_at?: string | null
          result?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_instance_id_fkey"
            columns: ["event_instance_id"]
            isOneToOne: false
            referencedRelation: "event_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rewards: {
        Row: {
          event_instance_id: string | null
          id: string
          name: string | null
          placement: number | null
        }
        Insert: {
          event_instance_id?: string | null
          id?: string
          name?: string | null
          placement?: number | null
        }
        Update: {
          event_instance_id?: string | null
          id?: string
          name?: string | null
          placement?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rewards_event_instance_id_fkey"
            columns: ["event_instance_id"]
            isOneToOne: false
            referencedRelation: "event_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_badges: {
        Row: {
          gym_id: string | null
          id: string
          name: string
        }
        Insert: {
          gym_id?: string | null
          id: string
          name: string
        }
        Update: {
          gym_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_badges_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_challenges: {
        Row: {
          description: string | null
          format: string | null
          gym_id: string | null
          id: string
          name: string | null
        }
        Insert: {
          description?: string | null
          format?: string | null
          gym_id?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          description?: string | null
          format?: string | null
          gym_id?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_challenges_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_leaders: {
        Row: {
          character_id: string | null
          end_date: string | null
          gym_id: string | null
          id: string
          is_head_leader: boolean | null
          start_date: string | null
        }
        Insert: {
          character_id?: string | null
          end_date?: string | null
          gym_id?: string | null
          id?: string
          is_head_leader?: boolean | null
          start_date?: string | null
        }
        Update: {
          character_id?: string | null
          end_date?: string | null
          gym_id?: string | null
          id?: string
          is_head_leader?: boolean | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_leaders_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_leaders_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_leaders_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_pokemon_species: {
        Row: {
          gym_id: string | null
          id: string
          max_level: number | null
          min_level: number | null
          notes: string | null
          species_id: number | null
          species_name: string | null
        }
        Insert: {
          gym_id?: string | null
          id?: string
          max_level?: number | null
          min_level?: number | null
          notes?: string | null
          species_id?: number | null
          species_name?: string | null
        }
        Update: {
          gym_id?: string | null
          id?: string
          max_level?: number | null
          min_level?: number | null
          notes?: string | null
          species_id?: number | null
          species_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_pokemon_species_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_staff: {
        Row: {
          character_id: string | null
          gym_id: string | null
          gym_role: string | null
          id: string
        }
        Insert: {
          character_id?: string | null
          gym_id?: string | null
          gym_role?: string | null
          id?: string
        }
        Update: {
          character_id?: string | null
          gym_id?: string | null
          gym_role?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_staff_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_staff_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_staff_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          city: string | null
          id: string
          league_id: string | null
          name: string
          region_id: string | null
        }
        Insert: {
          city?: string | null
          id: string
          league_id?: string | null
          name: string
          region_id?: string | null
        }
        Update: {
          city?: string | null
          id?: string
          league_id?: string | null
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gyms_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gyms_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "gyms_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "gyms_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      kenn_article_hashtags: {
        Row: {
          article_id: string
          tag: string
        }
        Insert: {
          article_id: string
          tag: string
        }
        Update: {
          article_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "kenn_article_hashtags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kenn_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      kenn_article_links: {
        Row: {
          article_id: string | null
          created_at: string | null
          external_url: string | null
          id: string
          label: string | null
          link_type: string | null
          target_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          external_url?: string | null
          id?: string
          label?: string | null
          link_type?: string | null
          target_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          external_url?: string | null
          id?: string
          label?: string | null
          link_type?: string | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kenn_article_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kenn_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      kenn_articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          content_source: string | null
          id: string
          image_url: string | null
          published_date: string | null
          region_id: string | null
          slug: string | null
          summary: string | null
          title: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_source?: string | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          region_id?: string | null
          slug?: string | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_source?: string | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          region_id?: string | null
          slug?: string | null
          summary?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kenn_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kenn_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kenn_articles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "kenn_articles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "kenn_articles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      kenn_report_subtypes: {
        Row: {
          article_id: string
          report_type: string
        }
        Insert: {
          article_id: string
          report_type: string
        }
        Update: {
          article_id?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "kenn_report_subtypes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kenn_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      league_dependencies: {
        Row: {
          child_league_id: string | null
          description: string | null
          id: string
          parent_league_id: string | null
          requirement_type: string | null
        }
        Insert: {
          child_league_id?: string | null
          description?: string | null
          id: string
          parent_league_id?: string | null
          requirement_type?: string | null
        }
        Update: {
          child_league_id?: string | null
          description?: string | null
          id?: string
          parent_league_id?: string | null
          requirement_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "league_dependencies_child_league_id_fkey"
            columns: ["child_league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_dependencies_parent_league_id_fkey"
            columns: ["parent_league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          id: string
          name: string
          region_id: string | null
          type: string | null
        }
        Insert: {
          id: string
          name: string
          region_id?: string | null
          type?: string | null
        }
        Update: {
          id?: string
          name?: string
          region_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "leagues_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "leagues_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      org_roles: {
        Row: {
          category: string | null
          id: string
          name: string
          tags: Json | null
        }
        Insert: {
          category?: string | null
          id: string
          name: string
          tags?: Json | null
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          tags?: Json | null
        }
        Relationships: []
      }
      organization_maps: {
        Row: {
          id: string
          image_url: string | null
          map_data: Json | null
          organization_id: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          map_data?: Json | null
          organization_id?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          map_data?: Json | null
          organization_id?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_maps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          banner_url: string | null
          description: string | null
          id: string
          image_url: string | null
          map_data: Json | null
          map_embed_url: string | null
          name: string
          region_id: string | null
          type: string | null
        }
        Insert: {
          banner_url?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          map_data?: Json | null
          map_embed_url?: string | null
          name: string
          region_id?: string | null
          type?: string | null
        }
        Update: {
          banner_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          map_data?: Json | null
          map_embed_url?: string | null
          name?: string
          region_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "organizations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "organizations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      plot_characters: {
        Row: {
          character_id: string | null
          id: string
          plot_id: string | null
          role: string | null
        }
        Insert: {
          character_id?: string | null
          id?: string
          plot_id?: string | null
          role?: string | null
        }
        Update: {
          character_id?: string | null
          id?: string
          plot_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plot_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plot_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plot_characters_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      plot_relations: {
        Row: {
          id: string
          relation_type: string | null
          source_plot_id: string | null
          target_plot_id: string | null
        }
        Insert: {
          id?: string
          relation_type?: string | null
          source_plot_id?: string | null
          target_plot_id?: string | null
        }
        Update: {
          id?: string
          relation_type?: string | null
          source_plot_id?: string | null
          target_plot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plot_relations_source_plot_id_fkey"
            columns: ["source_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plot_relations_target_plot_id_fkey"
            columns: ["target_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          contact_name: string | null
          contact_url: string | null
          created_at: string | null
          genre: string | null
          id: string
          status: string | null
          summary: string | null
          title: string | null
        }
        Insert: {
          contact_name?: string | null
          contact_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          status?: string | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          contact_name?: string | null
          contact_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          status?: string | null
          summary?: string | null
          title?: string | null
        }
        Relationships: []
      }
      pokemon: {
        Row: {
          alpha: boolean | null
          caught_at: string | null
          full_name: string | null
          gender: string | null
          id: string
          nicknames: Json | null
          shiny: boolean | null
          short_names: Json | null
          species_id: number | null
          species_name: string | null
        }
        Insert: {
          alpha?: boolean | null
          caught_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nicknames?: Json | null
          shiny?: boolean | null
          short_names?: Json | null
          species_id?: number | null
          species_name?: string | null
        }
        Update: {
          alpha?: boolean | null
          caught_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nicknames?: Json | null
          shiny?: boolean | null
          short_names?: Json | null
          species_id?: number | null
          species_name?: string | null
        }
        Relationships: []
      }
      pokemon_build_moves: {
        Row: {
          build_id: string | null
          id: string
          move: string | null
          slot_order: number | null
        }
        Insert: {
          build_id?: string | null
          id?: string
          move?: string | null
          slot_order?: number | null
        }
        Update: {
          build_id?: string | null
          id?: string
          move?: string | null
          slot_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_build_moves_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "pokemon_builds"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_builds: {
        Row: {
          ability: string | null
          created_at: string | null
          held_item: string | null
          id: string
          is_default: boolean | null
          level: number | null
          name: string | null
          pokemon_id: string | null
        }
        Insert: {
          ability?: string | null
          created_at?: string | null
          held_item?: string | null
          id?: string
          is_default?: boolean | null
          level?: number | null
          name?: string | null
          pokemon_id?: string | null
        }
        Update: {
          ability?: string | null
          created_at?: string | null
          held_item?: string | null
          id?: string
          is_default?: boolean | null
          level?: number | null
          name?: string | null
          pokemon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_builds_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_builds_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon_dashboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_ownership_history: {
        Row: {
          character_id: string | null
          end_date: string | null
          id: string
          pokemon_id: string | null
          start_date: string | null
        }
        Insert: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          pokemon_id?: string | null
          start_date?: string | null
        }
        Update: {
          character_id?: string | null
          end_date?: string | null
          id?: string
          pokemon_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_ownership_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon_dashboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_systems: {
        Row: {
          id: string
          name: string
          organization_id: string | null
          scope_type: string | null
        }
        Insert: {
          id: string
          name: string
          organization_id?: string | null
          scope_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string | null
          scope_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_systems_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_tiers: {
        Row: {
          id: string
          name: string
          ranking_system_id: string | null
          tier_order: number
        }
        Insert: {
          id: string
          name: string
          ranking_system_id?: string | null
          tier_order: number
        }
        Update: {
          id?: string
          name?: string
          ranking_system_id?: string | null
          tier_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_tiers_ranking_system_id_fkey"
            columns: ["ranking_system_id"]
            isOneToOne: false
            referencedRelation: "ranking_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      ribbons: {
        Row: {
          id: string
          image_url: string | null
          name: string
          region_id: string | null
        }
        Insert: {
          id: string
          image_url?: string | null
          name: string
          region_id?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ribbons_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["current_region_id"]
          },
          {
            foreignKeyName: "ribbons_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["origin_region_id"]
          },
          {
            foreignKeyName: "ribbons_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_classes: {
        Row: {
          color: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          color?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_characters: {
        Row: {
          character_id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          character_id: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          character_id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          discord_id: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          discord_id: string
          id?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          discord_id?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      character_dashboard_view: {
        Row: {
          age: number | null
          category: string | null
          character_badges: Json | null
          character_ribbons: Json | null
          classes: Json | null
          color: string | null
          current_region_id: string | null
          current_region_name: string | null
          dob: string | null
          external_sheet_url: string | null
          full_name: string | null
          gender: string | null
          height: string | null
          id: string | null
          image_src: string | null
          image_type: string | null
          nicknames: Json | null
          origin_region_id: string | null
          origin_region_name: string | null
          pokemon_active: Json | null
          pokemon_history: Json | null
          pokemon_owned_current: Json | null
          short_names: Json | null
          slug: string | null
          summary: string | null
          titles: Json | null
        }
        Relationships: []
      }
      pokemon_dashboard_view: {
        Row: {
          alpha: boolean | null
          builds: Json | null
          caught_at: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          nicknames: Json | null
          ownership_history: Json | null
          shiny: boolean | null
          short_names: Json | null
          species_id: number | null
          species_name: string | null
        }
        Insert: {
          alpha?: boolean | null
          builds?: never
          caught_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          nicknames?: Json | null
          ownership_history?: never
          shiny?: boolean | null
          short_names?: Json | null
          species_id?: number | null
          species_name?: string | null
        }
        Update: {
          alpha?: boolean | null
          builds?: never
          caught_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          nicknames?: Json | null
          ownership_history?: never
          shiny?: boolean | null
          short_names?: Json | null
          species_id?: number | null
          species_name?: string | null
        }
        Relationships: []
      }
      pokemon_ownership_active: {
        Row: {
          character_id: string | null
          end_date: string | null
          id: string | null
          pokemon_id: string | null
          start_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_ownership_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_ownership_history_pokemon_id_fkey"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon_dashboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
