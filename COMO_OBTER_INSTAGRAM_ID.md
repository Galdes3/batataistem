# 🆔 Como Obter o Instagram ID de um Perfil

O Instagram ID é um número único que identifica cada perfil. **NÃO é o mesmo que o username**.

## 🎯 Métodos para Obter o Instagram ID

### Método 1: Via API do Instagram (Recomendado - Requer Token)

Se você já tem um `INSTAGRAM_ACCESS_TOKEN` configurado:

```bash
# Substitua USERNAME pelo username do perfil
curl "https://graph.instagram.com/{USERNAME}?fields=id,username&access_token=SEU_TOKEN"
```

**Exemplo para o perfil `deck_sportbar`:**
```bash
curl "https://graph.instagram.com/deck_sportbar?fields=id,username&access_token=SEU_TOKEN"
```

**OU** use no navegador (substitua `SEU_TOKEN`):
```
https://graph.instagram.com/deck_sportbar?fields=id,username&access_token=SEU_TOKEN
```

---

### Método 2: Via Ferramentas Online (Mais Fácil - Sem Token)

#### Opção A: Instagram ID Finder

1. Acesse: [https://www.instagram.com/web/search/topsearch/?query=deck_sportbar](https://www.instagram.com/web/search/topsearch/?query=deck_sportbar)
2. Substitua `deck_sportbar` pelo username que você quer
3. Procure no JSON retornado pelo campo `pk` ou `id`

#### Opção B: Ferramentas Especializadas

1. **CodeOfArian** - [https://codeofaninja.com/tools/find-instagram-user-id/](https://codeofaninja.com/tools/find-instagram-user-id/)
   - Cole o username
   - Clique em "Find User ID"
   - Copie o ID retornado

2. **Comment Picker** - [https://commentpicker.com/instagram-user-id.php](https://commentpicker.com/instagram-user-id.php)
   - Digite o username
   - Clique em "Get User ID"
   - Copie o ID

3. **RapidTables** - [https://www.rapidtables.com/web/tools/instagram-user-id.html](https://www.rapidtables.com/web/tools/instagram-user-id.html)
   - Cole o username ou URL do perfil
   - Clique em "Get ID"
   - Copie o ID

---

### Método 3: Via Código JavaScript (No Console do Navegador)

1. Abra o perfil do Instagram no navegador (ex: `https://www.instagram.com/deck_sportbar/`)
2. Pressione `F12` para abrir o Console do Desenvolvedor
3. Cole este código e pressione Enter:

```javascript
// Método 1: Via window._sharedData
const data = window._sharedData;
if (data && data.entry_data && data.entry_data.ProfilePage) {
    const userId = data.entry_data.ProfilePage[0].graphql.user.id;
    console.log('Instagram ID:', userId);
    alert('Instagram ID: ' + userId);
}

// Método 2: Via API interna (se disponível)
fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username=deck_sportbar', {
    headers: {
        'X-IG-App-ID': '936619743392459'
    }
})
.then(r => r.json())
.then(data => {
    const userId = data.data.user.id;
    console.log('Instagram ID:', userId);
    alert('Instagram ID: ' + userId);
});
```

4. O ID aparecerá no console e em um alerta

---

### Método 4: Via URL do Perfil (Método Manual)

1. Acesse o perfil no Instagram (ex: `https://www.instagram.com/deck_sportbar/`)
2. Clique com botão direito → **"Inspecionar"** ou **"Inspect"**
3. Pressione `Ctrl+F` para buscar
4. Digite: `"id":`
5. Procure por um número longo (geralmente 10-15 dígitos)
6. Esse é o Instagram ID

---

### Método 5: Via Instagram Web (View Source)

1. Acesse o perfil no Instagram
2. Clique com botão direito → **"Exibir código-fonte"** ou **"View Page Source"**
3. Pressione `Ctrl+F` e busque por `"id":`
4. Procure por um número longo próximo a `"id":` seguido de `"username"`
5. Esse é o Instagram ID

---

## 🔧 Implementação no Sistema

Se quiser, posso adicionar uma funcionalidade no sistema para buscar o ID automaticamente quando você digitar o username. Isso facilitaria muito!

---

## 📝 Exemplo Prático: Perfil `deck_sportbar`

Para encontrar o ID do perfil `deck_sportbar`:

### Opção Mais Rápida (Recomendada):

1. Acesse: [https://codeofaninja.com/tools/find-instagram-user-id/](https://codeofaninja.com/tools/find-instagram-user-id/)
2. Cole: `deck_sportbar`
3. Clique em "Find User ID"
4. Copie o ID retornado
5. Cole no campo "Instagram ID" do formulário

### Ou via API (se tiver token):

```bash
curl "https://graph.instagram.com/deck_sportbar?fields=id,username&access_token=SEU_TOKEN"
```

---

## ⚠️ Observações Importantes

1. **O Instagram ID é um número** - geralmente entre 10 e 15 dígitos
2. **Não é o username** - o username pode mudar, mas o ID permanece o mesmo
3. **Perfis privados** - alguns métodos podem não funcionar para perfis privados
4. **Rate Limits** - se usar API, respeite os limites de requisições

---

## 🎯 Resumo: Qual Método Usar?

| Método | Facilidade | Requer Token | Confiabilidade |
|--------|-----------|--------------|---------------|
| **Ferramentas Online** | ⭐⭐⭐⭐⭐ | ❌ Não | ⭐⭐⭐⭐ |
| **API Instagram** | ⭐⭐⭐ | ✅ Sim | ⭐⭐⭐⭐⭐ |
| **Console do Navegador** | ⭐⭐⭐ | ❌ Não | ⭐⭐⭐ |
| **Inspecionar Código** | ⭐⭐ | ❌ Não | ⭐⭐⭐ |

**Recomendação:** Use ferramentas online (Método 2) para começar rapidamente!

---

## 🔗 Links Úteis

- [CodeOfArian - Instagram ID Finder](https://codeofaninja.com/tools/find-instagram-user-id/)
- [Comment Picker - Instagram User ID](https://commentpicker.com/instagram-user-id.php)
- [RapidTables - Instagram ID Tool](https://www.rapidtables.com/web/tools/instagram-user-id.html)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)

---

**Dica:** Se você cadastrar muitos perfis, posso criar uma funcionalidade no sistema para buscar o ID automaticamente quando você digitar o username! 🚀

