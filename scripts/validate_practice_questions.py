"""Validate the canonical self-authored practice bank (standard library only).

python scripts/validate_practice_questions.py [data/practice-questions.json]
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def validate(db):
    errors = []

    def check(condition, message):
        if not condition:
            errors.append(message)

    def text(value):
        return isinstance(value, str) and bool(value.strip())

    if not isinstance(db, dict):
        return ['bank must be an object']
    subjects, topics, questions = (db.get(k) for k in ('subjects', 'topics', 'questions'))
    if not isinstance(subjects, dict) or not subjects:
        errors.append('subjects must be a non-empty object')
        subjects = {}
    if not isinstance(topics, dict) or not topics:
        errors.append('topics must be a non-empty object')
        topics = {}
    if not isinstance(questions, list) or not questions:
        return errors + ['questions must be a non-empty array']
    for sid, subject in subjects.items():
        check(bool(re.fullmatch(r'L[12][1-3]', sid)), f'{sid}: invalid subject ID')
        if not isinstance(subject, dict):
            errors.append(f'{sid}: subject must be an object')
            continue
        check(subject.get('level') in ('初級', '中級'), f'{sid}: invalid level')
        check(subject.get('level') == ('初級' if sid.startswith('L1') else '中級'), f'{sid}: level mapping')
        check(text(subject.get('name')), f'{sid}: missing name')
        check(type(subject.get('minutes')) is int and subject['minutes'] > 0, f'{sid}: invalid minutes')
    for tid, name in topics.items():
        check(bool(re.fullmatch(r'L[12][1-3]\d{3}', tid)), f'{tid}: invalid topic ID')
        check(tid[:3] in subjects, f'{tid}: missing subject')
        check(text(name), f'{tid}: missing topic name')
    seen = set()
    required = ('id', 'level', 'subject', 'subjectName', 'topic', 'topicName', 'concept',
                'difficulty', 'question', 'options', 'answer', 'explanation', 'sourceType')
    official_fields = {'paper_id', 'question_no', 'source_page_start', 'source_page_end',
                       'competency_mapping_status', 'shared_context_id', 'visual_assets'}
    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            errors.append(f'question[{i}]: must be an object')
            continue
        label = f'question[{i}] {q.get("id", "?")}'
        check(all(k in q for k in required), f'{label}: missing required fields')
        qid = q.get('id')
        valid_id = isinstance(qid, str) and bool(re.fullmatch(r'Q\d{3,}', qid)) and int(qid[1:]) > 0
        check(valid_id, f'{label}: invalid self-authored ID')
        if isinstance(qid, str):
            check(qid not in seen, f'{label}: duplicate ID')
            seen.add(qid)
        sid, tid = q.get('subject'), q.get('topic')
        subject = subjects.get(sid) if isinstance(sid, str) else None
        check(isinstance(subject, dict), f'{label}: unknown subject')
        check(isinstance(tid, str) and tid in topics, f'{label}: unknown topic')
        check(isinstance(sid, str) and isinstance(tid, str) and tid.startswith(sid), f'{label}: topic/subject mapping')
        if isinstance(subject, dict):
            check(q.get('level') == subject.get('level'), f'{label}: level mismatch')
            check(q.get('subjectName') == subject.get('name'), f'{label}: subjectName mismatch')
        if isinstance(tid, str) and tid in topics:
            check(q.get('topicName') == topics[tid], f'{label}: topicName mismatch')
        check(q.get('difficulty') in ('easy', 'medium', 'hard'), f'{label}: unsupported difficulty')
        for field in ('question', 'explanation', 'concept', 'sourceType'):
            check(text(q.get(field)), f'{label}: empty/invalid {field}')
        options = q.get('options')
        valid_options = isinstance(options, list) and len(options) == 4 and all(text(o) for o in options)
        check(valid_options, f'{label}: exactly four non-empty string options required')
        if valid_options:
            check(len({o.strip() for o in options}) == 4, f'{label}: duplicate options')
        check(type(q.get('answer')) is int and 0 <= q['answer'] < 4, f'{label}: invalid answer index')
        source = q.get('sourceType', '')
        check(isinstance(source, str) and '自編' in source and '官方考古題' not in source,
              f'{label}: sourceType must identify self-authored content')
        check(not official_fields.intersection(q), f'{label}: official-paper fields in practice bank')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', nargs='?', type=pathlib.Path, default=ROOT / 'data/practice-questions.json')
    args = parser.parse_args()
    try:
        db = json.loads(args.source.read_text(encoding='utf-8'))
        errors = validate(db)
    except (OSError, ValueError) as error:
        errors = [str(error)]
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print(f'PASS: {len(db["questions"])} unique self-authored questions; metadata, mapping, options and answers valid')
    return 0


if __name__ == '__main__':
    sys.exit(main())
