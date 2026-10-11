package com.studentsync.security;

import java.lang.annotation.*;

/** Marks a controller parameter that receives the logged-in user. */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}
