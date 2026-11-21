#!/usr/bin/env bash
# Curate theme videos for the Daily Learning Journey: searches YouTube for each
# theme, then verifies every candidate ID via the oEmbed API (only existing,
# embeddable videos return 200 + title/author). Output: theme|videoId|title|author
set -u
declare -A Q=(
  [communication]="ted ed body language why we gesture when we talk"
  [animals]="ted ed surprising facts about animals"
  [history]="ted ed ancient egypt pyramids how were they built"
  [technology]="ted ed how does the internet work"
  [success]="ted ed growth mindset believing you can improve"
  [cultures]="ted ed the benefits of a bilingual brain"
  [everyday]="bbc learning english how to introduce yourself conversation"
  [space]="ted ed what would happen if there was no moon"
  [business]="ted ed what is money history of money"
  [environment]="ted ed plastic pollution in the ocean"
  [food]="ted ed the chemistry of cookies"
  [sport]="ted ed the history of football soccer"
)
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
for theme in "${!Q[@]}"; do
  q=$(echo "${Q[$theme]}" | tr ' ' '+')
  echo "### $theme"
  ids=$(curl -s --max-time 15 -H "User-Agent: $UA" "https://www.youtube.com/results?search_query=$q" \
    | grep -oE '"videoId":"[A-Za-z0-9_-]{11}"' | cut -d'"' -f4 | awk '!seen[$0]++' | head -4)
  for id in $ids; do
    o=$(curl -s --max-time 10 -H "User-Agent: $UA" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=$id&format=json")
    if echo "$o" | grep -q '"title"'; then
      title=$(echo "$o" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["title"][:80])' 2>/dev/null)
      author=$(echo "$o" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["author_name"][:40])' 2>/dev/null)
      echo "  $id | $title | $author"
    else
      echo "  $id | UNAVAILABLE"
    fi
  done
done
