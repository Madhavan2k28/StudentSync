package com.studentsync.dto;

import com.studentsync.model.Item;

/** A possible match for an item, with a 0-100 score and the reasons behind it. */
public record MatchResult(Item item, int score, java.util.List<String> reasons) {}
