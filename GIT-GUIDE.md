# Git 使用指南

這份指南是給**不熟悉程式的人**看的，從零開始說明如何安裝 Git、下載程式碼、更新版本，以及切換分支來測試新功能。

---

## 安裝 Git

- **Windows**：下載安裝 https://git-scm.com/download/win ，安裝時全部按下一步即可
- **Mac**：打開終端機輸入 `git --version`，系統會自動提示安裝

安裝完成後，打開「命令提示字元」（Windows）或「終端機」（Mac），輸入以下指令確認：

```bash
git --version
```

看到版本號（如 `git version 2.x.x`）就代表安裝成功。

---

## 基本概念

| 名詞 | 白話說明 |
|------|----------|
| **Repository（倉庫）** | 存放程式碼的地方，簡稱 repo |
| **Clone（複製）** | 把程式碼從 GitHub 下載到你的電腦 |
| **Pull（拉取）** | 把最新的更新同步到你的電腦 |
| **Branch（分支）** | 同一個專案的不同版本（見下方說明） |
| **Commit（提交）** | 把修改記錄下來，像是存檔 |
| **Push（推送）** | 把修改上傳到 GitHub |

---

## 打開終端機

所有 Git 操作都在終端機裡輸入指令。

- **Windows**：按 `Win + R`，輸入 `cmd`，按 Enter
- **Mac**：按 `Cmd + 空白鍵`，搜尋「終端機」，按 Enter

---

## 第一次下載程式碼

```bash
git clone https://github.com/rhyme0269-bit/heyids200.git
cd heyids200
```

下載完成後，搭配 Docker 啟動網站：

```bash
cp .env.example .env        # 建立環境設定檔（記得用記事本打開改帳號密碼）
docker compose up -d --build # 啟動網站
```

詳細的 Docker 安裝和環境設定步驟請見 [README.md](README.md)。

---

## 更新到最新版本

```bash
cd heyids200
git pull origin main         # 拉取最新程式碼
docker compose up -d --build # 重新建置並啟動
```

後台已編輯的資料（文字、圖片等）存在 Docker volume 裡，更新程式碼**不會覆蓋**。

---

## 回到舊版本

```bash
git log --oneline -10          # 查看版本紀錄
git checkout <版本編號>         # 切換到指定版本（例如 git checkout abc1234）
docker compose up -d --build   # 重新啟動
```

要回到最新版本：

```bash
git checkout main
docker compose up -d --build
```

---

## 分支（Branch）是什麼？

分支可以想像成**同一個專案的不同版本**，彼此獨立。

- **`main`** — 正式版本，穩定可用
- **`feature/xxx`** — 開發中的新功能，還沒合併到正式版
- **`dev`** — 開發用的測試版本

開發者會在分支上開發新功能，測試沒問題後才合併回 `main`。你可以切換到不同分支，來預覽和測試開發中的功能。

---

## 切換分支來測試新功能

### 步驟一：進入專案資料夾

```bash
cd heyids200
```

### 步驟二：更新分支清單

```bash
git fetch origin
```

這個指令不會改變你目前的東西，只是讓你的電腦知道 GitHub 上最新有哪些分支。

### 步驟三：查看有哪些分支

```bash
git branch -a
```

你會看到類似這樣的結果：

```
* main
  remotes/origin/main
  remotes/origin/feature/cms-builder
  remotes/origin/dev
```

- `*` 號代表你目前所在的分支
- `remotes/origin/` 開頭的是 GitHub 上的分支
- 你要測試的分支名稱是 `remotes/origin/` 後面的部分，例如 `feature/cms-builder`

### 步驟四：切換分支

```bash
git checkout feature/cms-builder
```

把 `feature/cms-builder` 換成你要測試的分支名稱。成功會看到：

```
Switched to branch 'feature/cms-builder'
```

### 步驟五：重新啟動網站

```bash
docker compose up -d --build
```

等待建置完成（大約 1～3 分鐘），然後打開瀏覽器到 `http://localhost:8081` 就能看到這個分支版本的網站了。

### 測試完畢，切回正式版

```bash
git checkout main
docker compose up -d --build
```

---

## 快速參考表

| 我想要... | 指令 |
|-----------|------|
| 看目前在哪個分支 | `git branch` |
| 看所有可用分支 | `git branch -a` |
| 更新分支清單 | `git fetch origin` |
| 切換分支 | `git checkout 分支名稱` |
| 切回正式版 | `git checkout main` |
| 拉取最新版本 | `git pull origin main` |
| 查看版本紀錄 | `git log --oneline -10` |
| 啟動網站 | `docker compose up -d --build` |
| 停止網站 | `docker compose down` |

---

## 常見問題

**Q: `git pull` 或切換分支時出現錯誤怎麼辦？**

如果看到衝突或 `error: Your local changes would be overwritten`，代表你的電腦上有修改過的檔案。執行以下指令暫存修改：

```bash
git stash
git pull origin main    # 或 git checkout 分支名稱
```

**Q: 分支清單裡找不到開發者說的分支？**

先執行 `git fetch origin` 更新一下，再用 `git branch -a` 看看。如果還是沒有，可能是開發者還沒推到 GitHub。

**Q: 網站啟動後看起來跟之前一樣？**

確認你有執行 `docker compose up -d --build`（有 `--build`），這樣才會用新程式碼重新建置。如果還是不行：

```bash
docker compose down
docker compose up -d --build
```

**Q: 切換分支後後台資料會不見嗎？**

不會。後台編輯的文字、上傳的圖片存在 Docker volume 裡，切換分支不影響資料。但新分支如果有新功能，可能會多出新的欄位或選項。

**Q: 怎麼確認目前在哪個分支？**

```bash
git branch
```

有 `*` 號標記的那一行就是你目前所在的分支。

**Q: 想回到之前的版本？**

```bash
git log --oneline -10          # 先查看版本紀錄
git checkout <版本編號>         # 切換到指定版本
docker compose up -d --build   # 重新啟動
```

最上面那一行就是目前的版本，前面的英數字串就是版本編號。
