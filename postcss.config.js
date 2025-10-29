module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

4. Commit

---

#### **Archivo 5: .gitignore**

1. **"Add file" → "Create new file"**
2. Nombre: `.gitignore`
3. Contenido:
```
node_modules
/.next/
/out/
/build
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
