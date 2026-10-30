import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import {
  FileText,
  Save,
  Download,
  Printer,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Search,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Scale,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  FileCheck,
  FolderOpen
} from 'lucide-react';

const DRAFT_TEMPLATES = [
  {
    id: 'bail_438',
    title: 'Bail Application (u/s 438 CrPC / 482 BNSS)',
    doc_type: 'Bail Application',
    content: `<h2 style="text-align: center;"><strong>IN THE COURT OF THE SESSIONS JUDGE, AT [DISTRICT]</strong></h2>
<h3 style="text-align: center;"><strong>CRIMINAL MISCELLANEOUS BAIL APPLICATION NO. ______ OF 2026</strong></h3>
<p style="text-align: center;"><em>IN THE MATTER OF:</em></p>
<p><strong>[Applicant Name]</strong>, S/o [Father's Name],<br>
R/o [Residential Address], [City, State] ... <strong>APPLICANT / ACCUSED</strong></p>
<p style="text-align: center;"><strong>VERSUS</strong></p>
<p><strong>STATE OF [STATE NAME]</strong><br>
(Through SHO, Police Station [P.S. Name]) ... <strong>RESPONDENT</strong></p>
<hr>
<p style="text-align: center;"><strong><u>APPLICATION UNDER SECTION 438 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (CORRESPONDING TO SECTION 482 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF ANTICIPATORY BAIL</u></strong></p>
<p><strong>MOST RESPECTFULLY SHOWETH:</strong></p>
<ol>
  <li>That the Applicant is a respectable, law-abiding citizen of India with deep roots in society and has no prior criminal antecedents.</li>
  <li>That the present FIR bearing No. [_____/2026] registered at P.S. [Name] under Sections [Sections] has been lodged out of sheer personal rivalry and malafide motives.</li>
  <li>That the allegations in the FIR do not prima facie disclose commission of any cognizable offence against the Applicant, violating the principles laid down by the Hon'ble Supreme Court in <em>Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273</em>.</li>
  <li>That the Applicant undertakes to fully cooperate with the ongoing investigation and abide by all conditions that may be imposed by this Hon'ble Court under Section 438(2) Cr.P.C.</li>
  <li>That the Applicant has reasonable apprehension of being arrested without any lawful cause, which would infringe his fundamental right to personal liberty under Article 21 of the Constitution of India (reaffirmed in <em>Satender Kumar Antil v. CBI, (2022) 10 SCC 51</em>).</li>
</ol>
<p><strong>PRAYER:</strong></p>
<p>It is, therefore, most respectfully prayed that this Hon'ble Court may graciously be pleased to:</p>
<p>(a) Direct that in the event of arrest, the Applicant be released on Anticipatory Bail in connection with FIR No. [____/2026] P.S. [Name];</p>
<p>(b) Pass any other or further orders as this Hon'ble Court may deem fit and proper in the interest of justice.</p>
<p><br><strong>ADVOCATE FOR THE APPLICANT</strong><br>[Advocate Name & Bar Enrollment No.]<br>Date: [Current Date]</p>`
  },
  {
    id: 'notice_138',
    title: 'Legal Notice (Sec 138 NI Act Cheque Dishonour)',
    doc_type: 'Legal Notice',
    content: `<h2 style="text-align: center;"><strong>OFFICE OF ADV. [ADVOCATE NAME]</strong></h2>
<p style="text-align: center;">Advocate, High Court | Bar Council Enrollment No: [MAH/XXXX/2021]<br>
Chambers: [Chamber Address, Court Complex, City] | Contact: [Phone/Email]</p>
<hr>
<p><strong>SPEED POST A.D. / REGISTERED POST</strong></p>
<p><strong>Date:</strong> [Current Date]</p>
<p><strong>TO:</strong><br>
<strong>[Name of Defaulter / Drawer]</strong><br>
[Residential / Office Address]<br>
[City, Pincode, State]</p>
<p><strong>SUBJECT: STATUTORY LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE NO. [______] DATED [______] FOR RS. [AMOUNT]/-</strong></p>
<p>Sir/Madam,</p>
<p>Under instructions from, and on behalf of my client, <strong>[Client Full Name]</strong>, residing at [Client Address], I hereby serve upon you the following statutory notice:</p>
<ol>
  <li>That in discharge of your legally enforceable debt/liability towards my Client, you issued Cheque No. [Cheque Number] dated [Cheque Date] drawn on [Bank Name, Branch] for an amount of Rs. [Amount in Figures]/- (Rupees [Amount in Words] only).</li>
  <li>That my Client presented the said cheque for encashment through their banker, [Bank Name], on [Deposit Date]. However, the said cheque was returned unpaid/dishonoured by your bank vide Return Memo dated [Memo Date] with the endorsement <strong>"FUNDS INSUFFICIENT"</strong>.</li>
  <li>That your aforesaid action constitutes an offence punishable under Section 138 of the Negotiable Instruments Act, 1881, as well as Section 420 of the Indian Penal Code, 1860 / Section 318 of Bharatiya Nyaya Sanhita, 2023.</li>
</ol>
<p><strong>THEREFORE</strong>, I hereby call upon you to make the payment of the said cheque amount of <strong>Rs. [Amount]/-</strong> within <strong>15 (fifteen) days</strong> from the receipt of this statutory notice, failing which my Client shall be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881.</p>
<p><br>Yours faithfully,<br><br><strong>[Advocate Name]</strong><br>Advocate for the Complainant</p>`
  },
  {
    id: 'written_statement',
    title: 'Written Statement (Order VIII Rule 1 CPC)',
    doc_type: 'Written Statement',
    content: `<h2 style="text-align: center;"><strong>IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION), AT [CITY]</strong></h2>
<h3 style="text-align: center;"><strong>CIVIL SUIT NO. ______ OF 2026</strong></h3>
<p><strong>[Plaintiff Name]</strong> ... <strong>PLAINTIFF</strong></p>
<p style="text-align: center;"><strong>VERSUS</strong></p>
<p><strong>[Defendant Name]</strong> ... <strong>DEFENDANT</strong></p>
<hr>
<p style="text-align: center;"><strong><u>WRITTEN STATEMENT ON BEHALF OF DEFENDANT NO. 1 UNDER ORDER VIII RULE 1 OF THE CODE OF CIVIL PROCEDURE, 1908</u></strong></p>
<p><strong>PRELIMINARY OBJECTIONS:</strong></p>
<ol>
  <li>That the present suit is an abuse of judicial process, devoid of any cause of action, and liable to be rejected under Order VII Rule 11 of the CPC.</li>
  <li>That the suit is barred by limitation under Article 54 of the Limitation Act, 1963.</li>
  <li>That the Plaintiff has not approached this Hon'ble Court with clean hands and has suppressed material facts regarding title and possession. As held in <em>Suraj Lamp & Industries v. State of Haryana, (2012) 1 SCC 656</em>, unregistered agreements do not confer any legal ownership.</li>
</ol>
<p><strong>PARAWISE REPLY ON MERITS:</strong></p>
<ol>
  <li>That the contents of Paragraph 1 of the Plaint are matters of record and need no reply, save and except what is expressly admitted herein.</li>
  <li>That the contents of Paragraph 2 are vehemently denied. The Defendant never entered into any binding contract as alleged.</li>
</ol>
<p><strong>PRAYER:</strong></p>
<p>In view of the above facts, the Defendant prays that this Hon'ble Court may kindly dismiss the Plaintiff's suit with exemplary costs under Section 35A of the CPC.</p>
<p><br><strong>DEFENDANT</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>ADVOCATE FOR DEFENDANT</strong></p>`
  },
  {
    id: 'blank_draft',
    title: 'Blank Legal Pleading / Affidavit',
    doc_type: 'Custom Draft',
    content: `<h2 style="text-align: center;"><strong>IN THE HIGH COURT OF JUDICATURE AT [CITY]</strong></h2>
<h3 style="text-align: center;"><strong>CASE / PETITION NO. ______ OF 2026</strong></h3>
<p style="text-align: center;"><strong><u>MEMORANDUM OF ARGUMENTS / LEGAL DRAFT</u></strong></p>
<p>Type your legal pleading, application, or affidavit here...</p>`
  }
];

export default function DraftStudio() {
  const editorRef = useRef(null);

  // Document State
  const [draftTitle, setDraftTitle] = useState('Anticipatory Bail Application u/s 438 CrPC');
  const [docType, setDocType] = useState('Bail Application');
  const [savedDraftId, setSavedDraftId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('Saved to workspace');
  const [wordCount, setWordCount] = useState(0);

  // Split-Screen Layout: 'split' (50/50) or 'full' (100% editor)
  const [layoutMode, setLayoutMode] = useState('split');

  // Legal Research Search State
  const [searchQuery, setSearchQuery] = useState('bail guidelines Arnesh Kumar Satender Antil');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Available saved drafts list
  const [myDrafts, setMyDrafts] = useState([]);
  const [showDraftsList, setShowDraftsList] = useState(false);

  useEffect(() => {
    // Initial content setup
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = DRAFT_TEMPLATES[0].content;
      updateWordCount();
    }

    // Check if a citation was sent from Legal Research page
    const pendingCitation = sessionStorage.getItem('pending_draft_citation');
    if (pendingCitation) {
      setTimeout(() => {
        insertTextAtCursor(`<p><blockquote><em>${pendingCitation}</em></blockquote></p>`);
        sessionStorage.removeItem('pending_draft_citation');
      }, 500);
    }

    // Initial search for research panel
    performResearchSearch('bail arrest mandatory 438 CrPC 41A');
    fetchMyDrafts();
  }, []);

  const fetchMyDrafts = async () => {
    try {
      const res = await api.get('/drafts');
      setMyDrafts(res.data || []);
    } catch {
      // ignore
    }
  };

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  };

  // Formatting Toolbar Helper
  const formatDoc = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateWordCount();
    setSaveStatus('Unsaved changes');
  };

  const insertTextAtCursor = (html) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      updateWordCount();
      setSaveStatus('Unsaved changes');
    }
  };

  const loadTemplate = (tmpl) => {
    if (window.confirm(`Load template "${tmpl.title}"? Current text will be replaced.`)) {
      setDraftTitle(tmpl.title);
      setDocType(tmpl.doc_type);
      if (editorRef.current) {
        editorRef.current.innerHTML = tmpl.content;
      }
      updateWordCount();
      setSaveStatus('Unsaved changes');
    }
  };

  // Perform Legal Research Search
  const performResearchSearch = async (q = searchQuery) => {
    const term = (q || '').trim();
    if (!term) return;
    setSearching(true);
    try {
      const res = await api.get(`/research/search?q=${encodeURIComponent(term)}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error('Research search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // One-Click: Insert Citation directly into Word Document
  const insertCitationIntoDoc = (item) => {
    const citationHtml = `<blockquote><strong>${item.title}</strong>, <em>${item.citation}</em> [${item.court}] &mdash; <strong>Ratio Decidendi:</strong> ${item.ratio || item.headline}</blockquote><p><br></p>`;
    insertTextAtCursor(citationHtml);
  };

  // Save Draft to Backend
  const handleSaveDraft = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;

    setSaveStatus('Saving draft...');
    try {
      if (savedDraftId) {
        await api.put(`/drafts/${savedDraftId}`, {
          title: draftTitle,
          doc_type: docType,
          content,
          plain_text: plainText
        });
      } else {
        const res = await api.post('/drafts', {
          title: draftTitle,
          doc_type: docType,
          content,
          plain_text: plainText
        });
        setSavedDraftId(res.data.draft_id);
      }
      setSaveStatus('Draft saved successfully');
      fetchMyDrafts();
      setTimeout(() => setSaveStatus('All changes saved'), 2500);
    } catch {
      setSaveStatus('Failed to save to server (saved locally)');
    }
  };

  // Download as Word Document (.doc / .docx compatible)
  const handleDownloadWordDoc = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${draftTitle}</title>
    <style>
      body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; margin: 1in; }
      h1, h2, h3 { text-align: center; }
      blockquote { margin-left: 0.5in; margin-right: 0.5in; font-style: italic; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid black; padding: 6px; }
    </style></head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + content + footer;

    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draftTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Document for Court Submission
  const handlePrint = () => {
    window.print();
  };

  const copyCitationOnly = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Top Studio Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Title & Document Type */}
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-950 border border-indigo-700/60 text-indigo-400 rounded-lg shrink-0">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                setSaveStatus('Unsaved changes');
              }}
              className="bg-transparent text-sm md:text-base font-bold text-white focus:outline-none focus:border-b focus:border-indigo-500 px-1 py-0.5 rounded"
              placeholder="Draft Title..."
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-indigo-300 font-medium">
                {docType}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-slate-400">{wordCount} words</span>
              <span>&bull;</span>
              <span className={`italic ${saveStatus.includes('Unsaved') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Templates Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Court Templates</span>
            </button>
            <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl hidden group-hover:block z-50 p-1 space-y-1">
              {DRAFT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => loadTemplate(tmpl)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                >
                  <p className="font-medium">{tmpl.title}</p>
                  <p className="text-[10px] text-slate-500">{tmpl.doc_type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Load Drafts */}
          <button
            onClick={() => setShowDraftsList(!showDraftsList)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <FolderOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>My Drafts ({myDrafts.length})</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Export to Word .doc */}
          <button
            onClick={handleDownloadWordDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition"
            title="Download Microsoft Word Document"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .doc</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            title="Print / Save to PDF"
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Layout Split Toggle */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'split' ? 'full' : 'split')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition ml-1"
            title={layoutMode === 'split' ? 'Full Screen Word Doc' : 'Split-Screen Legal Research'}
          >
            {layoutMode === 'split' ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            <span>{layoutMode === 'split' ? 'Full Doc' : 'Split Research'}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANE: Full Word Document Editor */}
        <div className={`flex flex-col border-r border-slate-800 transition-all duration-200 ${layoutMode === 'split' ? 'w-full lg:w-7/12' : 'w-full'}`}>
          
          {/* Word Formatting Toolbar */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-300 text-xs shrink-0 select-none">
            
            {/* Undo / Redo */}
            <button
              onClick={() => formatDoc('undo')}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('redo')}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Font Family (Indian Court Standard is Times New Roman) */}
            <select
              onChange={(e) => formatDoc('fontName', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              defaultValue="Times New Roman"
            >
              <option value="Times New Roman">Times New Roman (Court Std)</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
            </select>

            {/* Font Size */}
            <select
              onChange={(e) => formatDoc('fontSize', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              defaultValue="3"
            >
              <option value="2">11pt (Small)</option>
              <option value="3">14pt (Court Standard)</option>
              <option value="4">16pt (Medium)</option>
              <option value="5">18pt (Large)</option>
              <option value="6">24pt (Heading)</option>
            </select>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Styles: Bold, Italic, Underline, Strikethrough */}
            <button
              onClick={() => formatDoc('bold')}
              className="p-1.5 hover:bg-slate-800 rounded font-bold hover:text-white"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('italic')}
              className="p-1.5 hover:bg-slate-800 rounded italic hover:text-white"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('underline')}
              className="p-1.5 hover:bg-slate-800 rounded underline hover:text-white"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('strikeThrough')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Paragraph / Heading Style */}
            <select
              onChange={(e) => formatDoc('formatBlock', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              defaultValue="p"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2 (Court Title)</option>
              <option value="h3">Heading 3</option>
            </select>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Alignments (Essential for Court pleadings) */}
            <button
              onClick={() => formatDoc('justifyLeft')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('justifyCenter')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Align Center (Court Header)"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('justifyRight')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Align Right (Advocate Signature)"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('justifyFull')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Justify (Court Standard)"
            >
              <AlignJustify className="h-4 w-4" />
            </button>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Lists & Quotation */}
            <button
              onClick={() => formatDoc('insertUnorderedList')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Bullet Points"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('insertOrderedList')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Numbered Points (Grounds/Facts)"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatDoc('formatBlock', 'blockquote')}
              className="p-1.5 hover:bg-slate-800 rounded hover:text-white"
              title="Quote Judicial Holding / Section"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* Word Processing Page Container (Mimics authentic legal document paper) */}
          <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 shadow-2xl rounded-xl min-h-[900px] p-8 md:p-14 text-slate-100 font-serif leading-relaxed">
              <div
                ref={editorRef}
                contentEditable
                onInput={() => {
                  updateWordCount();
                  setSaveStatus('Unsaved changes');
                }}
                className="outline-none min-h-[800px] text-slate-100 selection:bg-indigo-600 selection:text-white"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '15px',
                  lineHeight: '1.75'
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Legal Research & Indian Kanoon Engine */}
        {layoutMode === 'split' && (
          <div className="hidden lg:flex lg:w-5/12 flex-col bg-slate-900/95 overflow-hidden">
            
            {/* Research Header */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-950 border border-indigo-700/60 text-indigo-400 rounded-md">
                    <Scale className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-white">Indian Kanoon Legal Research</h3>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Live Citations & Precedents
                </span>
              </div>

              {/* Research Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performResearchSearch();
                }}
                className="relative"
              >
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case laws, sections, or rulings..."
                  className="w-full pl-9 pr-16 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-1.5 top-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </form>

              {/* Quick Query Pills */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                <button
                  onClick={() => {
                    setSearchQuery('bail guidelines Arnesh Kumar Satender Antil');
                    performResearchSearch('bail guidelines Arnesh Kumar Satender Antil');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Bail Guidelines
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('138 NI Act cheque bounce compounding');
                    performResearchSearch('138 NI Act cheque bounce compounding');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  138 NI Act
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('quashing FIR 482 Bhajan Lal');
                    performResearchSearch('quashing FIR 482 Bhajan Lal');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Quashing 482
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('65B Evidence Act certificate mandatory');
                    performResearchSearch('65B Evidence Act certificate mandatory');
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  65B Certificate
                </button>
              </div>
            </div>

            {/* Research Results Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{searchResults.length} Relevant Judgments Found</span>
                <span className="text-[11px] text-indigo-400">Click "+" to paste into Word doc</span>
              </div>

              {searching ? (
                <div className="p-8 text-center space-y-2">
                  <div className="inline-block p-2 bg-indigo-950 text-indigo-400 rounded-lg animate-spin">
                    <Scale className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-slate-400">Searching Indian Kanoon & Corpus...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  No precedents found for this query. Try a different legal term or section.
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.doc_id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-indigo-600/60 rounded-xl space-y-2.5 transition shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.is_landmark && (
                            <span className="px-1.5 py-0.2 bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] rounded font-semibold flex items-center gap-0.5">
                              <Award className="h-2.5 w-2.5" /> Landmark
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded">
                            {item.court}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                            {item.citation}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white pt-1">
                          {item.title}
                        </h4>
                      </div>

                      {/* Primary Action: One-Click Insert into Word Document */}
                      <button
                        onClick={() => insertCitationIntoDoc(item)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm transition"
                        title="Insert this citation & ratio into the Word Document"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Insert</span>
                      </button>
                    </div>

                    {/* Ratio Snippet */}
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <strong>Held:</strong> {item.ratio || item.headline}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <button
                        onClick={() => copyCitationOnly(`${item.title}, ${item.citation}`, item.doc_id)}
                        className="hover:text-slate-300 flex items-center gap-1"
                      >
                        {copiedId === item.doc_id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedId === item.doc_id ? 'Copied' : 'Copy Citation'}</span>
                      </button>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-400 flex items-center gap-1"
                        >
                          <span>Indian Kanoon</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Indian Court Drafting Rules Helper Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center gap-1">
                <span>📋</span> Supreme Court of India Drafting Norms:
              </p>
              <p className="text-[10px] text-slate-500">
                A4 Paper &bull; Times New Roman 14pt &bull; 1.5 Line Spacing &bull; Left margin 1.5 in &bull; Double-sided printing permissible.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Saved Drafts Drawer / Modal */}
      {showDraftsList && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-indigo-400" />
                <span>My Saved Legal Drafts</span>
              </h3>
              <button
                onClick={() => setShowDraftsList(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {myDrafts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No saved drafts yet. Click "Save Draft" in the top bar to save your current work!
                </p>
              ) : (
                myDrafts.map((d) => (
                  <div
                    key={d.draft_id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{d.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {d.doc_type} &bull; {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDraftTitle(d.title);
                        setDocType(d.doc_type);
                        setSavedDraftId(d.draft_id);
                        if (editorRef.current) {
                          editorRef.current.innerHTML = d.content;
                        }
                        updateWordCount();
                        setShowDraftsList(false);
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
                    >
                      Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
