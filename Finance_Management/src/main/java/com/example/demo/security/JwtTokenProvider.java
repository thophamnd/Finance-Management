package com.example.demo.security;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import io.jsonwebtoken.security.Keys;
import java.security.Key;

@Component
public class JwtTokenProvider {

    // Chuỗi gốc (vẫn cần dài một chút)
    private final String JWT_SECRET = "DayLaChuoiBiMatSieuCapVipProDungDeKyTokenChoDuAnNhanhNhat2026CuaToi";
    private final long JWT_EXPIRATION = 604800000L;

    // Hàm bổ trợ để tạo Key chuẩn từ chuỗi String trên
    private Key getSigningKey() {
        byte[] keyBytes = JWT_SECRET.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + JWT_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Dùng Key thay vì String
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Dùng Key chuẩn
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}